import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProductQueryResponse {
    queryResult?: Array<Product>;
    error?: string;
}
export interface Product {
    id: bigint;
    shopId: bigint;
    name: string;
    tags: Array<string>;
    description: string;
    story?: string;
    image?: Uint8Array;
    price: bigint;
}
export interface Category {
    id: bigint;
    name: string;
}
export interface CustomOrderRequest {
    id: bigint;
    status: string;
    shopId: bigint;
    userId: Principal;
    description: string;
    timestamp: bigint;
}
export interface Shop {
    id: bigint;
    owner: Principal;
    name: string;
    description: string;
    announcements: Array<string>;
}
export interface UserProfile {
    bio?: string;
    name: string;
    email?: string;
}
export interface Review {
    id: bigint;
    userId: Principal;
    productId: bigint;
    comment: string;
    timestamp: bigint;
    rating: bigint;
    photos: Array<Uint8Array>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string): Promise<{
        categoryId?: bigint;
        error?: string;
        success: boolean;
    }>;
    addProduct(product: Product): Promise<{
        error?: string;
        success: boolean;
    }>;
    addReview(productId: bigint, rating: bigint, comment: string, photos: Array<Uint8Array>): Promise<{
        error?: string;
        success: boolean;
        reviewId?: bigint;
    }>;
    addShopAnnouncement(shopId: bigint, announcement: string): Promise<{
        error?: string;
        success: boolean;
    }>;
    addToFavorites(shopId: bigint): Promise<{
        error?: string;
        success: boolean;
    }>;
    addToWishlist(productId: bigint): Promise<{
        error?: string;
        success: boolean;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomOrderRequest(shopId: bigint, description: string): Promise<{
        error?: string;
        orderId?: bigint;
        success: boolean;
    }>;
    createShop(name: string, description: string): Promise<{
        shopId?: bigint;
        error?: string;
        success: boolean;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getMyCustomOrders(): Promise<Array<CustomOrderRequest>>;
    getMyFavorites(): Promise<Array<bigint>>;
    getMyWishlist(): Promise<Array<bigint>>;
    getProductQuery(searchText: string, rangeStart: bigint, rangeEnd: bigint): Promise<ProductQueryResponse>;
    getProducts(): Promise<Array<Product>>;
    getProductsByPrice(): Promise<Array<Product>>;
    getReviewsForProduct(productId: bigint): Promise<Array<Review>>;
    getShopCustomOrders(shopId: bigint): Promise<{
        orders?: Array<CustomOrderRequest>;
        error?: string;
        success: boolean;
    }>;
    getShops(): Promise<Array<Shop>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFromFavorites(shopId: bigint): Promise<{
        error?: string;
        success: boolean;
    }>;
    removeFromWishlist(productId: bigint): Promise<{
        error?: string;
        success: boolean;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchText: string): Promise<Array<Product>>;
}
