import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  ProductCategoryDto,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  TekstilApiResponse,
} from '../types/TekstilTypes';

class TekstilProductCategoryService {
  /**
   * Get all product categories (public)
   */
  async getAllProductCategories(lang?: string): Promise<{ success: boolean; data: ProductCategoryDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}?lang=${lang}` 
        : API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product categories');
      }

      const result: TekstilApiResponse<ProductCategoryDto[]> = await response.json();
      return {
        success: true,
        data: result.value || [],
      };
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get active product categories (public)
   */
  async getActiveProductCategories(lang?: string): Promise<{ success: boolean; data: ProductCategoryDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}/active?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}/active`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active product categories');
      }

      const result: TekstilApiResponse<ProductCategoryDto[]> = await response.json();
      return {
        success: true,
        data: result.value || [],
      };
    } catch (error) {
      console.error('Error fetching active product categories:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get product category by ID (public)
   */
  async getProductCategoryById(id: number, lang?: string): Promise<{ success: boolean; data: ProductCategoryDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}/${id}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product category');
      }

      const result: TekstilApiResponse<ProductCategoryDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching product category:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get product category by slug (public)
   */
  async getProductCategoryBySlug(slug: string, lang?: string): Promise<{ success: boolean; data: ProductCategoryDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}/slug/${slug}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}/slug/${slug}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product category');
      }

      const result: TekstilApiResponse<ProductCategoryDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching product category:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Create product category (admin only)
   */
  async createProductCategory(category: CreateProductCategoryDto): Promise<{ success: boolean; data: ProductCategoryDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product category');
      }

      const result: TekstilApiResponse<ProductCategoryDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error creating product category:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update product category (admin only)
   */
  async updateProductCategory(id: number, category: UpdateProductCategoryDto): Promise<{ success: boolean; data: ProductCategoryDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product category');
      }

      const result: TekstilApiResponse<ProductCategoryDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error updating product category:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete product category (admin only)
   */
  async deleteProductCategory(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PRODUCT_CATEGORIES}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product category');
      }

      return {
        success: true,
        message: 'Product category deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting product category:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new TekstilProductCategoryService();


