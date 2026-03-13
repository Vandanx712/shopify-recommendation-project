import axios from "axios";
import productModel from "../models/product.model.js";
import { Product } from "../models/fproduct.model.js";
import eventsModel from "../models/events.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const { shopId } = req.body;
    if (!shopId)
      return res.status(401).json({
        success: false,
        message: "Missing field",
      });

    let page = 1;
    const allproducts = [];

    while (true) {
      const response = await axios.get(
        `https://${shopId}/products.json?limit=250&page=${page}`,
      );

      const products = response.data.products;

      if (!products || products.length === 0) break;

      allproducts.push(...products);

      page++;
    }

    const operations = allproducts.map((product) => ({
      updateOne: {
        filter: { shopifyStoreID: shopId, id: product.id },
        update: {
          $set: {
            shopifyStoreID: shopId,
            id: product.id,
            title: product.title,
            handle: product.handle,
            vendor: product.vendor,
            product_type: product.product_type,
            tags: product.tags,
            options: product.options,
            variants: product.variants,
          },
        },
        upsert: true,
      },
    }));

    await productModel.bulkWrite(operations);

    const flaskFormat = {
      store_id: shopId,
      products: [],
    };

    allproducts.forEach((product) => {
      flaskFormat.products.push({
        id: product.id.toString(),
        store_id: shopId,
        title: product.title,
        product_type: product.product_type,
        vendor: product.vendor,
        tags: product.tags,
        options: product.options.map((opt) => {
          return { name: opt.name, values: opt.values };
        }),
        price: Number(product.variants[0].price),
      });
    });

    await axios.post(`${process.env.FLASK_URL}/v1/sync/bulk`, flaskFormat);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const createCaseInsensitivePatterns = (values) => {
  if (!values) return undefined;
  if (typeof values === "string") {
    values = values.split(",").map((v) => v.trim());
  }
  return Array.isArray(values) ? values : [values];
};

const createCaseInsensitivePatternsCollentions = (field, values) => {
  if (!values) return [];

  if (typeof values === "string") {
    values = values.split(",").map((v) => v.trim());
  }

  const list = Array.isArray(values) ? values : [values];

  return list.map((value) => ({
    [field]: { $regex: new RegExp(value, "i") },
  }));
};

const getBestSellingProducts = async (filters, limit, skip) => {
  try {
    // Build the product query from filters
    const productQuery = await buildSharedQuery(filters);

    // Get total count of products that match the filters
    const totalProducts = await Product.countDocuments(productQuery);

    // Use aggregation to get products with sales data and apply filters
    const pipeline = [
      // Match products based on filters
      { $match: productQuery },

      // Lookup orders for each product
      {
        $lookup: {
          from: "orders",
          localField: "productId",
          foreignField: "product_id",
          as: "orders",
        },
      },

      // Add total sales quantity field
      {
        $addFields: {
          totalSaleQty: {
            $sum: "$orders.quantity",
          },
        },
      },

      // Sort by total sales quantity in descending order
      { $sort: { totalSaleQty: -1 } },

      // Apply pagination
      { $skip: skip },
      { $limit: limit },

      // Remove orders field and keep only necessary data
      {
        $project: {
          orders: 0,
        },
      },
    ];

    const products = await Product.aggregate(pipeline);

    return {
      products,
      total: totalProducts,
    };
  } catch (error) {
    console.error("Error in getBestSellingProducts:", error);
    throw error;
  }
};

export const buildSharedQuery = async (queryParams) => {
  const {
    search = "",
    category,
    tags,
    color,
    size,
    material,
    season,
    minPrice,
    maxPrice,
    gender,
    productGroup,
    productType,
    brand,
    fabric,
    work,
    collections,
    style,
    id,
    productId,
  } = queryParams;

  // Base query - always include available products
  const query = {
    isAvailable: true,
  };

  // Filter by id or productId if provided
  if (id) {
    query.productId = id;
    return query;
  }
  if (productId) {
    query.productId = productId;
    return query;
  }

  // Handle search
  // if (search && search.length >= 3) {
  //   try {
  //     const queryEmbedding = await vectorService.generateQueryEmbedding(search);
  //     const similarProducts = await vectorService.searchSimilarProducts(
  //       queryEmbedding,
  //       {
  //         limit: parseInt(queryParams.limit || 20),
  //         minScore: 0.6,
  //       },
  //     );

  //     if (similarProducts.length > 0) {
  //       query._id = { $in: similarProducts.map((p) => p.productId) };
  //     } else {
  //       query.$or = [
  //         { name: { $regex: search, $options: "i" } },
  //         { description: { $regex: search, $options: "i" } },
  //         { tags: { $regex: search, $options: "i" } },
  //       ];
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Vector search failed, falling back to text search:",
  //       error,
  //     );
  //     query.$or = [
  //       { name: { $regex: search, $options: "i" } },
  //       { description: { $regex: search, $options: "i" } },
  //       { tags: { $regex: search, $options: "i" } },
  //     ];
  //   }
  // } else if (search) {
  //   query.$or = [
  //     { name: { $regex: search, $options: "i" } },
  //     { description: { $regex: search, $options: "i" } },
  //     { tags: { $regex: search, $options: "i" } },
  //   ];
  // }

  // Apply common filters
  if (category) {
    query.categories = { $in: createCaseInsensitivePatterns(category) };
  }

  const collectionParam = collections; // Use collection first, fallback to collection_handle
  if (
    collectionParam &&
    collectionParam.toLowerCase() !== "products" &&
    collectionParam.toLowerCase() !== "all"
  ) {
    const collectionArray = Array.isArray(collectionParam)
      ? collectionParam
      : collectionParam.split(",").map((c) => c.trim());

    query.collection_handle = {
      $in: createCaseInsensitivePatterns(collectionArray),
    };
  }
  if (tags) {
    query.tags = { $in: createCaseInsensitivePatterns(tags) };
  }

  if (color) {
    query["attributes.color"] = { $in: createCaseInsensitivePatterns(color) };
  }

  if (size) {
    query["attributes.size"] = { $in: createCaseInsensitivePatterns(size) };
  }

  if (material) {
    query["attributes.material"] = {
      $in: createCaseInsensitivePatterns(material),
    };
  }

  if (season) {
    query["attributes.season"] = { $in: createCaseInsensitivePatterns(season) };
  }

  if (gender) {
    query["attributes.gender"] = { $in: createCaseInsensitivePatterns(gender) };
  }

  if (productGroup) {
    query.productGroup = { $in: createCaseInsensitivePatterns(productGroup) };
  }

  if (productType) {
    query.productType = { $in: createCaseInsensitivePatterns(productType) };
  }
  if (brand) {
    const brandOrConditions = createCaseInsensitivePatternsCollentions(
      "brand",
      brand,
    );

    if (brandOrConditions.length) {
      query.$or = brandOrConditions;
    }
    // if (brand) {
    //   query.brand = { $in: createCaseInsensitivePatterns(brand) };
    // }
  }

  if (fabric) {
    query["attributes.fabric"] = { $in: createCaseInsensitivePatterns(fabric) };
  }

  if (work) {
    query["attributes.work"] = { $in: createCaseInsensitivePatterns(work) };
  }

  if (style) {
    query["attributes.style"] = { $in: createCaseInsensitivePatterns(style) };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  return query;
};

export const getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      sort = "best_seller",
      order = "desc",
      bypassCache = false,
      ...filters
    } = req.query;
    const { id } = req.params;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // if (filters["vendors?q"]) {
    //   filters.brand = filters["vendors?q"]; // Assign value to 'brand'
    //   delete filters["vendors?q"]; // Remove original key
    // }

    // 🔐 Cache key
    // const cacheFilters = {
    //   ...filters,
    //   page: pageNum,
    //   limit: limitNum,
    //   sort,
    //   order,
    // };

    // const baseKey = generateProductCacheKey(cacheFilters);

    // 💾 Try cache
    // const cachedResult = productCache.get(baseKey);
    // if (!bypassCache && cachedResult && productCache.isValid(baseKey)) {
    //   console.log("Cache hit for products");
    //   return res.json(cachedResult);
    // }
    const events = await eventsModel
      .find({ userId: id, eventType: "view_product" })
      .select("product")
      .lean();

    const ids = events.map((event) => event.product.productId);

    let response;

    if (sort === "best_seller") {
      const { products, total } = await getBestSellingProducts(
        filters,
        limitNum,
        skip,
      );

      response = {
        success: true,
        data: {
          products,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
          filters,
          totalAvailableProducts: total,
        },
      };
    } else {
      const query = await buildSharedQuery(filters);

      let sortOptions = {};
      switch (sort) {
        case "featured":
          sortOptions = { featured: -1 };
          break;
        case "alphabetical_asc":
          sortOptions = { name: 1 };
          break;
        case "alphabetical_desc":
          sortOptions = { name: -1 };
          break;
        case "price_asc":
          sortOptions = { price: 1 };
          break;
        case "price_desc":
          sortOptions = { price: -1 };
          break;
        case "date_old_to_new":
          sortOptions = { createdAt: 1 };
          break;
        case "date_new_to_old":
          sortOptions = { createdAt: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const filter = {
        ...query,
        productId: { $nin: ids },
      };

      const [products, viewedProducts, total] = await Promise.all([
        Product.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.find({ productId: { $in: ids } }).lean(),
        Product.countDocuments(filter),
      ]);

      response = {
        success: true,
        data: {
          products: [...viewedProducts, ...products].slice(0, limitNum),
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
          filters,
          totalAvailableProducts: total,
        },
      };
    }

    // Store in cache only if not bypassing
    // if (!bypassCache) {
    //   productCache.set(baseKey, response);
    // }

    res.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      message: error.message,
    });
  }
};
