import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  TekstilApiResponse,
  TekstilPaginatedResponse,
} from '../types/TekstilTypes';

class TekstilProductService {
  /**
   * Get all products with pagination (public)
   */
  async getAllProducts(
    page: number = 1, 
    pageSize: number = 10, 
    lang?: string,
    categoryId?: number,
    isFeatured?: boolean
  ): Promise<{ success: boolean; data: TekstilPaginatedResponse<ProductDto> | null }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (lang) params.append('lang', lang);
      if (categoryId) params.append('categoryId', categoryId.toString());
      if (isFeatured !== undefined) params.append('isFeatured', isFeatured.toString());

      const response = await fetch(`${API_ROUTES.TEKSTIL.PRODUCTS}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result: TekstilApiResponse<TekstilPaginatedResponse<ProductDto>> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get featured products (public)
   */
  async getFeaturedProducts(lang?: string): Promise<{ success: boolean; data: ProductDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PRODUCTS}/featured?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PRODUCTS}/featured`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }

      const result: TekstilApiResponse<ProductDto[]> = await response.json();
      return {
        success: true,
        data: result.value || [],
      };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get product by ID (public)
   */
  async getProductById(id: number, lang?: string): Promise<{ success: boolean; data: ProductDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PRODUCTS}/${id}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PRODUCTS}/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const result: TekstilApiResponse<ProductDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get product by slug (public)
   */
  async getProductBySlug(slug: string, lang?: string): Promise<{ success: boolean; data: ProductDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PRODUCTS}/slug/${slug}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PRODUCTS}/slug/${slug}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const result: TekstilApiResponse<ProductDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get products by category (public)
   */
  async getProductsByCategory(categoryId: number, lang?: string): Promise<{ success: boolean; data: ProductDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PRODUCTS}/category/${categoryId}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PRODUCTS}/category/${categoryId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products by category');
      }

      const result: TekstilApiResponse<ProductDto[]> = await response.json();
      return {
        success: true,
        data: result.value || [],
      };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Create product (admin only)
   */
  async createProduct(product: CreateProductDto): Promise<{ success: boolean; data: ProductDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PRODUCTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      const result: TekstilApiResponse<ProductDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update product (admin only)
   */
  async updateProduct(id: number, product: UpdateProductDto): Promise<{ success: boolean; data: ProductDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PRODUCTS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const result: TekstilApiResponse<ProductDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete product (admin only)
   */
  async deleteProduct(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PRODUCTS}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Increment product view count (public)
   */
  async incrementViewCount(id: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_ROUTES.TEKSTIL.PRODUCTS}/${id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to increment view count');
      }

      return { success: true };
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return { success: false };
    }
  }
}

export default new TekstilProductService();


