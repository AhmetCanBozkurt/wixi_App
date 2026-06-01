import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storefrontApi } from '../../../entities/StorePage/api/storePageApi';
import { useCartStore } from '../../../entities/Cart/model/store';
import { useCustomerStore } from '../../../entities/Customer/model/store';
import styles from './StorefrontProductDetailPage.module.css';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  attributesJson: string;
  isActive: boolean;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number;
  vatRate?: number;
  shortDescription?: string;
  description?: string;
  categoryName?: string;
  brandName?: string;
  mainImageUrl?: string;
  galleryUrls: string[];
  isActive: boolean;
  variants: ProductVariant[];
}

type AttributeMap = Record<string, string[]>;

function parseAttributes(json: string): Record<string, string> {
  try { return JSON.parse(json) as Record<string, string>; }
  catch { return {}; }
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
}

function buildAttributeMap(variants: ProductVariant[]): AttributeMap {
  const map: AttributeMap = {};
  for (const v of variants) {
    if (!v.isActive) continue;
    const attrs = parseAttributes(v.attributesJson);
    for (const [key, value] of Object.entries(attrs)) {
      if (!map[key]) map[key] = [];
      if (!map[key].includes(value)) map[key].push(value);
    }
  }
  return map;
}

function findMatchingVariant(
  variants: ProductVariant[],
  selectedAttrs: Record<string, string>
): ProductVariant | undefined {
  const keys = Object.keys(selectedAttrs);
  if (keys.length === 0) return undefined;
  return variants.find((v) => {
    if (!v.isActive) return false;
    const attrs = parseAttributes(v.attributesJson);
    return keys.every((k) => attrs[k] === selectedAttrs[k]);
  });
}

// Seçili attrs + bu opsiyon için en az 1 aktif variant var mı?
function isOptionAvailable(
  variants: ProductVariant[],
  selectedAttrs: Record<string, string>,
  checkKey: string,
  checkValue: string
): boolean {
  const testAttrs: Record<string, string> = {};
  for (const [k, v] of Object.entries(selectedAttrs)) {
    if (k !== checkKey) testAttrs[k] = v;
  }
  testAttrs[checkKey] = checkValue;
  return variants.some((v) => {
    if (!v.isActive) return false;
    const attrs = parseAttributes(v.attributesJson);
    return Object.entries(testAttrs).every(([k, val]) => attrs[k] === val);
  });
}

export const StorefrontProductDetailPage = () => {
  const { tenantSlug, slug } = useParams<{ tenantSlug: string; slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hydrate } = useCustomerStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tenantSlug) hydrate(tenantSlug);
  }, [tenantSlug, hydrate]);

  useEffect(() => {
    if (!tenantSlug || !slug) return;
    setIsLoading(true);
    storefrontApi.getProductBySlug(tenantSlug, slug)
      .then((res) => {
        const p = res.data as ProductDetail;
        if (!p.variants) p.variants = [];
        if (!p.galleryUrls) p.galleryUrls = [];
        setProduct(p);
        setSelectedImg(p.mainImageUrl || null);
        setSelectedAttrs({});
        setQuantity(1);
      })
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [tenantSlug, slug]);

  const attributeMap = useMemo(
    () => (product ? buildAttributeMap(product.variants) : {}),
    [product]
  );

  const attrKeys = Object.keys(attributeMap);
  const hasVariants = attrKeys.length > 0;

  const matchedVariant = useMemo(
    () => (product ? findMatchingVariant(product.variants, selectedAttrs) : undefined),
    [product, selectedAttrs]
  );

  const displayPrice = matchedVariant?.price ?? product?.basePrice ?? 0;
  const displayCompare = matchedVariant?.compareAtPrice ?? product?.compareAtPrice;
  const outOfStock = matchedVariant ? matchedVariant.stockQuantity <= 0 : false;

  const maxQty = matchedVariant ? Math.max(1, matchedVariant.stockQuantity) : 99;
  const isLowStock =
    matchedVariant &&
    matchedVariant.stockQuantity > 0 &&
    matchedVariant.stockQuantity <= (matchedVariant.lowStockThreshold || 5);

  const selectAttr = (key: string, value: string) => {
    setSelectedAttrs((prev) => ({ ...prev, [key]: value }));
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!tenantSlug || !product) return;
    if (!isAuthenticated) {
      navigate(`/store/${tenantSlug}/login`);
      return;
    }
    if (hasVariants && !matchedVariant) {
      toast.error('Lütfen tüm seçenekleri seçin.');
      return;
    }
    if (outOfStock) {
      toast.error('Bu varyant stokta yok.');
      return;
    }
    setAdding(true);
    try {
      await addItem(tenantSlug, {
        productId: product.id,
        quantity,
        ...(matchedVariant ? { variantId: matchedVariant.id } : {}),
      });
      toast.success('Ürün sepete eklendi!');
    } catch {
      toast.error('Sepete eklenirken hata oluştu.');
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) return <div className={styles.loading}>Yükleniyor...</div>;
  if (!product) return <div className={styles.loading}>Ürün bulunamadı.</div>;

  const images = product.galleryUrls?.length
    ? product.galleryUrls
    : product.mainImageUrl
    ? [product.mainImageUrl]
    : [];

  const discountPct =
    displayCompare && displayCompare > displayPrice
      ? Math.round(((displayCompare - displayPrice) / displayCompare) * 100)
      : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {product.categoryName && (
          <nav className={styles.breadcrumb}>
            <Link to={`/store/${tenantSlug}`}>Ana Sayfa</Link>
            <span>/</span>
            <span>{product.categoryName}</span>
            <span>/</span>
            <span>{product.name}</span>
          </nav>
        )}

        <div className={styles.layout}>
          {/* ── Gallery ── */}
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              {selectedImg
                ? <img src={selectedImg} alt={product.name} />
                : <div className={styles.imgPlaceholder} />
              }
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((url, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${selectedImg === url ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImg(url)}
                  >
                    <img src={url} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className={styles.info}>
            {product.brandName && <p className={styles.brand}>{product.brandName}</p>}
            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.priceRow}>
              <span className={styles.price}>
                {displayPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
              {displayCompare && displayCompare > displayPrice && (
                <span className={styles.comparePrice}>
                  {displayCompare.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              )}
              {discountPct > 0 && (
                <span className={styles.discountBadge}>%{discountPct} İndirim</span>
              )}
            </div>

            {product.shortDescription && (
              <p className={styles.shortDesc}>{product.shortDescription}</p>
            )}

            {/* ── Variant selectors ── */}
            {attrKeys.map((key) => (
              <div key={key} className={styles.attrGroup}>
                <div className={styles.attrLabel}>
                  {key}
                  {selectedAttrs[key] && !isHexColor(selectedAttrs[key]) && (
                    <span className={styles.attrSelected}>: {selectedAttrs[key]}</span>
                  )}
                </div>
                <div className={styles.attrOptions}>
                  {attributeMap[key].map((value) => {
                    const isColor = isHexColor(value);
                    const isChosen = selectedAttrs[key] === value;
                    const available = isOptionAvailable(product.variants, selectedAttrs, key, value);
                    return isColor ? (
                      <button
                        key={value}
                        title={value}
                        disabled={!available}
                        className={[
                          styles.colorSwatch,
                          isChosen ? styles.colorSwatchActive : '',
                          !available ? styles.colorSwatchUnavailable : '',
                        ].join(' ')}
                        style={{ background: value }}
                        onClick={() => available && selectAttr(key, value)}
                      />
                    ) : (
                      <button
                        key={value}
                        disabled={!available}
                        className={[
                          styles.variantBtn,
                          isChosen ? styles.variantBtnActive : '',
                          !available ? styles.variantBtnUnavailable : '',
                        ].join(' ')}
                        onClick={() => available && selectAttr(key, value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Stok uyarıları */}
            {hasVariants && matchedVariant && outOfStock && (
              <p className={styles.outOfStock}>Bu kombinasyon stokta yok.</p>
            )}
            {isLowStock && (
              <p className={styles.lowStock}>
                Son {matchedVariant!.stockQuantity} adet kaldı!
              </p>
            )}

            {/* ── Quantity ── */}
            <div className={styles.qtyRow}>
              <label className={styles.qtyLabel}>Adet</label>
              <div className={styles.qty}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className={styles.qtyVal}>{quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.min(q + 1, maxQty))}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className={styles.addBtn}
              onClick={handleAddToCart}
              disabled={adding || outOfStock || (hasVariants && !matchedVariant)}
            >
              {adding
                ? 'Ekleniyor...'
                : outOfStock
                ? 'Stokta Yok'
                : hasVariants && !matchedVariant
                ? 'Seçenek Seçin'
                : 'Sepete Ekle'}
            </button>

            {/* SKU display */}
            {matchedVariant && (
              <p className={styles.skuRow}>SKU: <span>{matchedVariant.sku}</span></p>
            )}

            {product.description && (
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
