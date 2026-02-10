import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import VarArray "mo:core/VarArray";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  type Product = {
    id : Nat;
    name : Text;
    tags : [Text];
    description : Text;
    price : Int;
    image : ?Blob;
    shopId : Nat;
    story : ?Text;
  };

  type Shop = {
    id : Nat;
    owner : Principal;
    name : Text;
    description : Text;
    announcements : [Text];
  };

  type Category = {
    id : Nat;
    name : Text;
  };

  type Review = {
    id : Nat;
    productId : Nat;
    userId : Principal;
    rating : Nat;
    comment : Text;
    photos : [Blob];
    timestamp : Int;
  };

  type CustomOrderRequest = {
    id : Nat;
    userId : Principal;
    shopId : Nat;
    description : Text;
    status : Text;
    timestamp : Int;
  };

  type WishlistEntry = {
    userId : Principal;
    productId : Nat;
    timestamp : Int;
  };

  type FavoriteEntry = {
    userId : Principal;
    shopId : Nat;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    bio : ?Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };

    public func compareByPrice(p1 : Product, p2 : Product) : Order.Order {
      Int.compare(p1.price, p2.price);
    };
  };

  // Store products in a map for efficient search
  let productsMap = Map.empty<Nat, Product>();
  let shopsMap = Map.empty<Nat, Shop>();
  let categoriesMap = Map.empty<Nat, Category>();
  let reviewsMap = Map.empty<Nat, Review>();
  let customOrdersMap = Map.empty<Nat, CustomOrderRequest>();
  let wishlistMap = Map.empty<Principal, [Nat]>();
  let favoritesMap = Map.empty<Principal, [Nat]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextProductId : Nat = 0;
  var nextShopId : Nat = 0;
  var nextCategoryId : Nat = 0;
  var nextReviewId : Nat = 0;
  var nextCustomOrderId : Nat = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management - Public queries
  public query ({ caller }) func getProducts() : async [Product] {
    productsMap.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByPrice() : async [Product] {
    productsMap.values().toArray().sort(Product.compareByPrice);
  };

  public query ({ caller }) func searchProducts(searchText : Text) : async [Product] {
    let filtered = productsMap.values().toArray().filter(
      func(product) {
        product.name.contains(#text searchText) or product.tags.find(
          func(tag) {
            tag.contains(#text searchText);
          }
        ) != null or product.description.contains(#text searchText);
      }
    );
    filtered;
  };

  type ProductQueryResponse = {
    queryResult : ?[Product];
    error : ?Text;
  };

  public query ({ caller }) func getProductQuery(searchText : Text, rangeStart : Int, rangeEnd : Int) : async ProductQueryResponse {
    let filtered = productsMap.values().toArray().filter(
      func(product) {
        product.name.contains(#text searchText) or product.tags.find(
          func(tag) {
            tag.contains(#text searchText);
          }
        ) != null or product.description.contains(#text searchText);
      }
    );

    let filteredArray = filtered;
    let startIndex = if (rangeStart >= 0) {
      rangeStart.toNat();
    } else {
      return {
        queryResult = null;
        error = ?"rangeStart must be >= 0";
      };
    };

    let endIndex = if (rangeEnd >= 0) {
      rangeEnd.toNat();
    } else {
      return {
        queryResult = null;
        error = ?"rangeEnd must be >= 0";
      };
    };

    if (startIndex >= endIndex or endIndex > filteredArray.size()) {
      return {
        queryResult = null;
        error = ?"Invalid range";
      };
    };

    return {
      queryResult = ?filteredArray.sliceToArray(startIndex, endIndex);
      error = null;
    };
  };

  // Add product - requires shop ownership or admin
  public shared ({ caller }) func addProduct(product : Product) : async { success : Bool; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        error = ?"Unauthorized: Only users can add products";
      };
    };

    // Check if shop exists and caller is owner or admin
    switch (shopsMap.get(product.shopId)) {
      case null {
        return {
          success = false;
          error = ?"Shop not found";
        };
      };
      case (?shop) {
        if (shop.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          return {
            success = false;
            error = ?"Unauthorized: Only shop owner or admin can add products";
          };
        };
      };
    };

    let productWithId = {
      id = nextProductId;
      name = product.name;
      tags = product.tags;
      description = product.description;
      price = product.price;
      image = product.image;
      shopId = product.shopId;
      story = product.story;
    };
    productsMap.add(nextProductId, productWithId);
    nextProductId += 1;
    return { success = true; error = null };
  };

  // Shop Management
  public shared ({ caller }) func createShop(name : Text, description : Text) : async { success : Bool; shopId : ?Nat; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        shopId = null;
        error = ?"Unauthorized: Only users can create shops";
      };
    };

    let shop : Shop = {
      id = nextShopId;
      owner = caller;
      name = name;
      description = description;
      announcements = [];
    };
    shopsMap.add(nextShopId, shop);
    let currentShopId = nextShopId;
    nextShopId += 1;
    return { success = true; shopId = ?currentShopId; error = null };
  };

  public query ({ caller }) func getShops() : async [Shop] {
    shopsMap.values().toArray();
  };

  public shared ({ caller }) func addShopAnnouncement(shopId : Nat, announcement : Text) : async { success : Bool; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        error = ?"Unauthorized: Only users can add announcements";
      };
    };

    switch (shopsMap.get(shopId)) {
      case null {
        return {
          success = false;
          error = ?"Shop not found";
        };
      };
      case (?shop) {
        if (shop.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          return {
            success = false;
            error = ?"Unauthorized: Only shop owner or admin can add announcements";
          };
        };
        let updatedShop = {
          id = shop.id;
          owner = shop.owner;
          name = shop.name;
          description = shop.description;
          announcements = shop.announcements.concat([announcement]);
        };
        shopsMap.add(shopId, updatedShop);
        return { success = true; error = null };
      };
    };
  };

  // Category Management - Admin only
  public shared ({ caller }) func addCategory(name : Text) : async { success : Bool; categoryId : ?Nat; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return {
        success = false;
        categoryId = null;
        error = ?"Unauthorized: Only admins can add categories";
      };
    };

    let category : Category = {
      id = nextCategoryId;
      name = name;
    };
    categoriesMap.add(nextCategoryId, category);
    let currentCategoryId = nextCategoryId;
    nextCategoryId += 1;
    return { success = true; categoryId = ?currentCategoryId; error = null };
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categoriesMap.values().toArray();
  };

  // Review Management - Authenticated users only
  public shared ({ caller }) func addReview(productId : Nat, rating : Nat, comment : Text, photos : [Blob]) : async { success : Bool; reviewId : ?Nat; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        reviewId = null;
        error = ?"Unauthorized: Only users can add reviews";
      };
    };

    if (rating > 5) {
      return {
        success = false;
        reviewId = null;
        error = ?"Rating must be between 0 and 5";
      };
    };

    switch (productsMap.get(productId)) {
      case null {
        return {
          success = false;
          reviewId = null;
          error = ?"Product not found";
        };
      };
      case (?_) {
        let review : Review = {
          id = nextReviewId;
          productId = productId;
          userId = caller;
          rating = rating;
          comment = comment;
          photos = photos;
          timestamp = Time.now();
        };
        reviewsMap.add(nextReviewId, review);
        let currentReviewId = nextReviewId;
        nextReviewId += 1;
        return { success = true; reviewId = ?currentReviewId; error = null };
      };
    };
  };

  public query ({ caller }) func getReviewsForProduct(productId : Nat) : async [Review] {
    reviewsMap.values().toArray().filter(func(review) { review.productId == productId });
  };

  // Custom Order Requests - Authenticated users only
  public shared ({ caller }) func createCustomOrderRequest(shopId : Nat, description : Text) : async { success : Bool; orderId : ?Nat; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        orderId = null;
        error = ?"Unauthorized: Only users can create custom order requests";
      };
    };

    switch (shopsMap.get(shopId)) {
      case null {
        return {
          success = false;
          orderId = null;
          error = ?"Shop not found";
        };
      };
      case (?_) {
        let order : CustomOrderRequest = {
          id = nextCustomOrderId;
          userId = caller;
          shopId = shopId;
          description = description;
          status = "pending";
          timestamp = Time.now();
        };
        customOrdersMap.add(nextCustomOrderId, order);
        let currentOrderId = nextCustomOrderId;
        nextCustomOrderId += 1;
        return { success = true; orderId = ?currentOrderId; error = null };
      };
    };
  };

  public query ({ caller }) func getMyCustomOrders() : async [CustomOrderRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    customOrdersMap.values().toArray().filter(func(order) { order.userId == caller });
  };

  public query ({ caller }) func getShopCustomOrders(shopId : Nat) : async { success : Bool; orders : ?[CustomOrderRequest]; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        orders = null;
        error = ?"Unauthorized: Only users can view shop orders";
      };
    };

    switch (shopsMap.get(shopId)) {
      case null {
        return {
          success = false;
          orders = null;
          error = ?"Shop not found";
        };
      };
      case (?shop) {
        if (shop.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          return {
            success = false;
            orders = null;
            error = ?"Unauthorized: Only shop owner or admin can view shop orders";
          };
        };
        let orders = customOrdersMap.values().toArray().filter(func(order) { order.shopId == shopId });
        return { success = true; orders = ?orders; error = null };
      };
    };
  };

  // Wishlist Management - Authenticated users only
  public shared ({ caller }) func addToWishlist(productId : Nat) : async { success : Bool; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        error = ?"Unauthorized: Only users can manage wishlists";
      };
    };

    switch (productsMap.get(productId)) {
      case null {
        return {
          success = false;
          error = ?"Product not found";
        };
      };
      case (?_) {
        let currentWishlist = switch (wishlistMap.get(caller)) {
          case null { [] };
          case (?list) { list };
        };
        let updatedWishlist = currentWishlist.concat([productId]);
        wishlistMap.add(caller, updatedWishlist);
        return { success = true; error = null };
      };
    };
  };

  public shared ({ caller }) func removeFromWishlist(productId : Nat) : async { success : Bool; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        error = ?"Unauthorized: Only users can manage wishlists";
      };
    };

    switch (wishlistMap.get(caller)) {
      case null {
        return {
          success = false;
          error = ?"Wishlist is empty";
        };
      };
      case (?list) {
        let updatedWishlist = list.filter(func(id) { id != productId });
        wishlistMap.add(caller, updatedWishlist);
        return { success = true; error = null };
      };
    };
  };

  public query ({ caller }) func getMyWishlist() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wishlists");
    };
    switch (wishlistMap.get(caller)) {
      case null { [] };
      case (?list) { list };
    };
  };

  // Favorites Management - Authenticated users only
  public shared ({ caller }) func addToFavorites(shopId : Nat) : async { success : Bool; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        error = ?"Unauthorized: Only users can manage favorites";
      };
    };

    switch (shopsMap.get(shopId)) {
      case null {
        return {
          success = false;
          error = ?"Shop not found";
        };
      };
      case (?_) {
        let currentFavorites = switch (favoritesMap.get(caller)) {
          case null { [] };
          case (?list) { list };
        };
        let updatedFavorites = currentFavorites.concat([shopId]);
        favoritesMap.add(caller, updatedFavorites);
        return { success = true; error = null };
      };
    };
  };

  public shared ({ caller }) func removeFromFavorites(shopId : Nat) : async { success : Bool; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        error = ?"Unauthorized: Only users can manage favorites";
      };
    };

    switch (favoritesMap.get(caller)) {
      case null {
        return {
          success = false;
          error = ?"Favorites list is empty";
        };
      };
      case (?list) {
        let updatedFavorites = list.filter(func(id) { id != shopId });
        favoritesMap.add(caller, updatedFavorites);
        return { success = true; error = null };
      };
    };
  };

  public query ({ caller }) func getMyFavorites() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view favorites");
    };
    switch (favoritesMap.get(caller)) {
      case null { [] };
      case (?list) { list };
    };
  };
};
