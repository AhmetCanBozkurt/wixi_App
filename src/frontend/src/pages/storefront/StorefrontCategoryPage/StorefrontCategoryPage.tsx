import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { storefrontApi } from '../../../entities/StorePage/api/storePageApi';
import styles from './StorefrontCategoryPage.module.css';

interface Category { id: string; name: string; slug: string; }
interface Brand    { id: string; name: string; slug: string; }
interface Product  { id: string; name: string; slug: string; basePrice: number; mainImageUrl?: string; }

const SORT_OPTIONS = [
  { value: '',            label: 'Önerilen' },
  { value: 'newest',     label: 'En Yeni' },
  { value: 'price_asc',  label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
];

export const StorefrontCategoryPage = () => {
  const { tenantSlug, slug } = useParams<{ tenantSlug: string; slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory]     = useState<Category | null>(null);
  const [brands,   setBrands]       = useState<Brand[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [total,    setTotal]        = useState(0);
  const [isLoading, setIsLoading]   = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // URL'den filtre state'i oku
  const sortBy   = searchParams.get('sortBy') ?? '';
  const brandIds = searchParams.getAll('brand');
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

  // Fiyat debounce ref'i
  const priceDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updateParam = useCallback((key: string, value: string | string[] | undefined) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete(key);
      if (Array.isArray(value)) {
        value.forEach(v => next.append(key, v));
      } else if (value !== undefined && value !== '') {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Kategoriler + markalar — yalnızca slug değişince yeniden çek
  useEffect(() => {
    if (!tenantSlug || !slug) return;
    Promise.all([
      storefrontApi.getCategories(tenantSlug),
      storefrontApi.getBrands(tenantSlug),
    ]).then(([catRes, brandRes]) => {
      const cats = catRes.data as Category[];
      const rawBrands = brandRes.data as { items?: Brand[] } | Brand[];
      setBrands(
        Array.isArray(rawBrands)
          ? rawBrands
          : (rawBrands as { items?: Brand[] }).items ?? []
      );
      setCategory(cats.find(c => c.slug === slug) ?? null);
    });
  }, [tenantSlug, slug]);

  // Ürünler — filtreler değişince yeniden çek
  useEffect(() => {
    if (!tenantSlug || !slug) return;
    setIsLoading(true);

    const params: Record<string, unknown> = {
      categorySlug: slug,
      isActive: true,
      pageSize: 24,
      ...(sortBy                    && { sortBy }),
      ...(brandIds.length === 1     && { brandId: brandIds[0] }),
      ...(minPrice !== undefined    && { minPrice }),
      ...(maxPrice !== undefined    && { maxPrice }),
    };

    storefrontApi.getProducts(tenantSlug, params)
      .then(res => {
        const data = res.data as { items: Product[]; totalCount: number };
        setProducts(data.items ?? []);
        setTotal(data.totalCount ?? 0);
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug, slug, sortBy, brandIds.join(','), minPrice, maxPrice]);

  // Aktif filtre chip'lerini oluştur
  const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];

  if (sortBy) {
    const opt = SORT_OPTIONS.find(o => o.value === sortBy);
    if (opt) {
      activeFilters.push({
        key: 'sort',
        label: `Sıralama: ${opt.label}`,
        onRemove: () => updateParam('sortBy', ''),
      });
    }
  }

  brandIds.forEach(bid => {
    const brand = brands.find(b => b.id === bid);
    if (brand) {
      activeFilters.push({
        key: `brand-${bid}`,
        label: brand.name,
        onRemove: () => updateParam('brand', brandIds.filter(b => b !== bid)),
      });
    }
  });

  if (minPrice !== undefined) {
    activeFilters.push({
      key: 'minPrice',
      label: `Min ₺${minPrice}`,
      onRemove: () => updateParam('minPrice', ''),
    });
  }
  if (maxPrice !== undefined) {
    activeFilters.push({
      key: 'maxPrice',
      label: `Max ₺${maxPrice}`,
      onRemove: () => updateParam('maxPrice', ''),
    });
  }

  const handlePriceChange = (min?: number, max?: number) => {
    clearTimeout(priceDebounce.current);
    priceDebounce.current = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('minPrice');
        next.delete('maxPrice');
        if (min !== undefined) next.set('minPrice', String(min));
        if (max !== undefined) next.set('maxPrice', String(max));
        return next;
      }, { replace: true });
    }, 400);
  };

  const sidebar = (
    <aside className={styles.sidebar}>
      {/* Fiyat aralığı filtresi */}
      <div className={styles.filterSection}>
        <h4 className={styles.filterTitle}>Fiyat Aralığı</h4>
        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="Min ₺"
            defaultValue={minPrice}
            className={styles.priceInput}
            onChange={e =>
              handlePriceChange(
                e.target.value ? Number(e.target.value) : undefined,
                maxPrice
              )
            }
          />
          <span className={styles.priceSep}>—</span>
          <input
            type="number"
            placeholder="Max ₺"
            defaultValue={maxPrice}
            className={styles.priceInput}
            onChange={e =>
              handlePriceChange(
                minPrice,
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      {/* Marka filtresi */}
      {brands.length > 0 && (
        <div className={styles.filterSection}>
          <h4 className={styles.filterTitle}>Marka</h4>
          <div className={styles.brandList}>
            {brands.map(b => (
              <label key={b.id} className={styles.brandItem}>
                <input
                  type="checkbox"
                  className={styles.brandCheck}
                  checked={brandIds.includes(b.id)}
                  onChange={e => {
                    const next = e.target.checked
                      ? [...brandIds, b.id]
                      : brandIds.filter(id => id !== b.id);
                    updateParam('brand', next);
                  }}
                />
                <span>{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Sayfa başlığı ve sıralama/filtre aksiyonları */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>{category?.name || slug}</h1>
          <div className={styles.headerActions}>
            <button className={styles.filterToggle} onClick={() => setDrawerOpen(true)}>
              Filtrele
            </button>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={e => updateParam('sortBy', e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Aktif filtre chip'leri */}
        {activeFilters.length > 0 && (
          <div className={styles.chips}>
            {activeFilters.map(f => (
              <span key={f.key} className={styles.chip}>
                {f.label}
                <button className={styles.chipRemove} onClick={f.onRemove}>×</button>
              </span>
            ))}
            <button
              className={styles.chipClear}
              onClick={() => setSearchParams({}, { replace: true })}
            >
              Tümünü Temizle
            </button>
          </div>
        )}

        <div className={styles.layout}>
          {/* Desktop sidebar */}
          <div className={styles.desktopSidebar}>{sidebar}</div>

          {/* Ürün grid */}
          <div className={styles.main}>
            {isLoading ? (
              <div className={styles.loading}>Yükleniyor...</div>
            ) : products.length === 0 ? (
              <p className={styles.empty}>Bu kriterlere uygun ürün bulunamadı.</p>
            ) : (
              <>
                <p className={styles.resultCount}>{total} ürün bulundu</p>
                <div className={styles.grid}>
                  {products.map(p => (
                    <Link
                      key={p.id}
                      to={`/store/${tenantSlug}/product/${p.slug}`}
                      className={styles.card}
                    >
                      <div className={styles.imgWrap}>
                        {p.mainImageUrl
                          ? <img src={p.mainImageUrl} alt={p.name} loading="lazy" />
                          : <div className={styles.imgPlaceholder} />
                        }
                      </div>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardName}>{p.name}</div>
                        <div className={styles.cardPrice}>₺{p.basePrice.toFixed(2)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobil filtre drawer */}
        {drawerOpen && (
          <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
            <div className={styles.drawer} onClick={e => e.stopPropagation()}>
              <div className={styles.drawerHeader}>
                <span>Filtreler</span>
                <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>✕</button>
              </div>
              {sidebar}
              <button className={styles.drawerApply} onClick={() => setDrawerOpen(false)}>
                Uygula
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
