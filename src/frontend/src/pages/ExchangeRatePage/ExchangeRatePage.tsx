import { useState, useEffect } from 'react';
import { FaExchangeAlt, FaSync, FaFilter, FaCalculator } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Card, Input, Button, DateInput, Select, MultiSelect } from '../../shared/ui';
import styles from './ExchangeRatePage.module.css';

interface ExchangeRate extends Record<string, unknown> {
  id: string;
  rateDate: string;
  currencyCode: string;
  unit: number;
  forexBuying?: number;
  forexSelling?: number;
  banknoteBuying?: number;
  banknoteSelling?: number;
  source: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol?: string;
}

interface ParityResult {
  fromCode: string;
  toCode: string;
  rate: number;
  rateDate: string;
  description: string;
}

interface CrossParityResult extends ParityResult {
  formulaBreakdown: string;
  tryPerFrom?: number;
  tryPerTo?: number;
}

interface ConversionResult {
  amount: number;
  fromCode: string;
  toCode: string;
  rate: number;
  convertedAmount: number;
  rateDate: string;
  rateField: string;
}

const RATE_FIELD_OPTIONS = [
  { label: 'Forex Alış', value: 'ForexBuying' },
  { label: 'Forex Satış', value: 'ForexSelling' },
  { label: 'Banknot Alış', value: 'BanknoteBuying' },
  { label: 'Banknot Satış', value: 'BanknoteSelling' }
];

export const ExchangeRatePage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});

  // Parity
  const [parityFrom, setParityFrom] = useState('');
  const [parityTo, setParityTo] = useState('');
  const [parityDate, setParityDate] = useState('');
  const [parityResult, setParityResult] = useState<ParityResult | null>(null);
  const [parityLoading, setParityLoading] = useState(false);

  // Cross Parity
  const [crossFrom, setCrossFrom] = useState('');
  const [crossTo, setCrossTo] = useState('');
  const [crossDate, setCrossDate] = useState('');
  const [crossResult, setCrossResult] = useState<CrossParityResult | null>(null);
  const [crossLoading, setCrossLoading] = useState(false);

  // Conversion
  const [convAmount, setConvAmount] = useState('');
  const [convFrom, setConvFrom] = useState('');
  const [convTo, setConvTo] = useState('');
  const [convDate, setConvDate] = useState('');
  const [convRateField, setConvRateField] = useState('ForexSelling');
  const [convResult, setConvResult] = useState<ConversionResult | null>(null);
  const [convLoading, setConvLoading] = useState(false);

  useEffect(() => {
    apiClient.get<{ items: Currency[] }>('currency?activeOnly=true')
      .then(res => setCurrencies(res.data.items || []))
      .catch(() => {});
  }, []);

  const currencyOptions = currencies.map(c => ({ label: `${c.code} — ${c.name}`, value: c.code }));
  const multiSelectOptions = currencies.map(c => ({ label: `${c.code}`, value: c.code }));

  const handleFilter = () => {
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (selectedCodes.length === 1) params.currencyCode = selectedCodes[0];
    setSearchParams(params);
    setRefreshKey(prev => prev + 1);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await apiClient.post('exchange-rates/sync-tcmb', {});
      const data = res.data;
      if (data.status === 'Success') {
        toast.success(`TCMB senkronizasyonu tamamlandı. ${data.ratesSaved} kur kaydedildi.`);
      } else if (data.status === 'Holiday') {
        toast.success('Bugün resmi tatil — TCMB kur yayınlamadı.');
      } else {
        toast.error(`Senkronizasyon hatası: ${data.errorMessage || data.status}`);
      }
      setRefreshKey(prev => prev + 1);
    } catch {
      toast.error('TCMB senkronizasyonu başarısız.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleParity = async () => {
    if (!parityFrom || !parityTo) {
      toast.error('Kaynak ve hedef para birimi seçiniz.');
      return;
    }
    setParityLoading(true);
    try {
      const params: Record<string, string> = { from: parityFrom, to: parityTo };
      if (parityDate) params.date = parityDate;
      const res = await apiClient.get<ParityResult>('exchange-rates/parity', { params });
      setParityResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Parite hesaplanamadı.';
      toast.error(msg);
    } finally {
      setParityLoading(false);
    }
  };

  const handleCrossParity = async () => {
    if (!crossFrom || !crossTo) {
      toast.error('Kaynak ve hedef para birimi seçiniz.');
      return;
    }
    setCrossLoading(true);
    try {
      const params: Record<string, string> = { from: crossFrom, to: crossTo };
      if (crossDate) params.date = crossDate;
      const res = await apiClient.get<CrossParityResult>('exchange-rates/cross-parity', { params });
      setCrossResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Çapraz parite hesaplanamadı.';
      toast.error(msg);
    } finally {
      setCrossLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!convAmount || !convFrom || !convTo) {
      toast.error('Miktar, kaynak ve hedef para birimi giriniz.');
      return;
    }
    setConvLoading(true);
    try {
      const params: Record<string, string | number> = {
        amount: parseFloat(convAmount),
        from: convFrom,
        to: convTo,
        rateField: convRateField
      };
      if (convDate) params.date = convDate;
      const res = await apiClient.get<ConversionResult>('exchange-rates/convert', { params });
      setConvResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Dönüşüm yapılamadı.';
      toast.error(msg);
    } finally {
      setConvLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <FaExchangeAlt className={styles.mainIcon} />
          <div>
            <h1>Döviz Kurları</h1>
            <p>TCMB döviz kurlarını görüntüleyin, sorgulayın ve senkronize edin.</p>
          </div>
        </div>
        <button className={styles.syncBtn} onClick={handleSync} disabled={isSyncing}>
          <FaSync className={isSyncing ? styles.spinning : ''} />
          {isSyncing ? 'Senkronize Ediliyor...' : "TCMB'den Çek"}
        </button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <DateInput
          label="Başlangıç"
          value={fromDate}
          onChange={setFromDate}
          placeholder="Başlangıç tarihi..."
        />
        <DateInput
          label="Bitiş"
          value={toDate}
          onChange={setToDate}
          placeholder="Bitiş tarihi..."
        />
        <MultiSelect
          label="Para Birimleri"
          options={multiSelectOptions}
          values={selectedCodes}
          onChange={setSelectedCodes}
          placeholder="Tümü..."
        />
        <div className={styles.filterAction}>
          <Button variant="primary" leftIcon={<FaFilter />} onClick={handleFilter}>
            Filtrele
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className={styles.content}>
        <AdvancedDataTable<ExchangeRate>
          key={refreshKey}
          dataSource="exchange-rates"
          searchParams={searchParams}
          columns={[
            {
              field: 'rateDate',
              title: 'Tarih',
              width: 130,
              template: (row) => new Date(row.rateDate).toLocaleDateString('tr-TR')
            },
            {
              field: 'currencyCode',
              title: 'Kod',
              width: 90,
              template: (row) => <code className={styles.codeBadge}>{row.currencyCode}</code>
            },
            {
              field: 'unit',
              title: 'Birim',
              width: 80,
              template: (row) => <Badge variant="info" size="sm">{row.unit}</Badge>
            },
            {
              field: 'forexBuying',
              title: 'Forex Alış',
              template: (row) => row.forexBuying ? row.forexBuying.toFixed(4) : '—'
            },
            {
              field: 'forexSelling',
              title: 'Forex Satış',
              template: (row) => row.forexSelling ? row.forexSelling.toFixed(4) : '—'
            },
            {
              field: 'banknoteBuying',
              title: 'Bknt. Alış',
              template: (row) => row.banknoteBuying ? row.banknoteBuying.toFixed(4) : '—'
            },
            {
              field: 'banknoteSelling',
              title: 'Bknt. Satış',
              template: (row) => row.banknoteSelling ? row.banknoteSelling.toFixed(4) : '—'
            },
            {
              field: 'source',
              title: 'Kaynak',
              width: 110,
              template: (row) => (
                <Badge variant={row.source === 'TCMB' ? 'primary' : 'warning'} size="sm">
                  {row.source}
                </Badge>
              )
            }
          ]}
          sortable={true}
          selectable={true}
          reorderable={true}
          resizable={true}
          pageable={{ pageSize: 20 }}
          toolbar={['search', 'excel', 'pdf']}
          exportTitle="Doviz_Kurlari"
        />
      </div>

      {/* Calculation Section */}
      <div className={styles.calculationSection}>

        {/* Parity Card */}
        <Card title="Parite Hesaplama" subtitle="İki para birimi arasındaki oranı hesaplayın">
          <div className={styles.calcForm}>
            <Select
              label="Kaynak"
              options={currencyOptions}
              value={parityFrom}
              onChange={v => setParityFrom(String(v))}
              placeholder="Seçiniz..."
            />
            <Select
              label="Hedef"
              options={currencyOptions}
              value={parityTo}
              onChange={v => setParityTo(String(v))}
              placeholder="Seçiniz..."
            />
            <DateInput
              label="Tarih (opsiyonel)"
              value={parityDate}
              onChange={setParityDate}
              placeholder="Son kur kullanılır"
            />
            <Button
              variant="primary"
              leftIcon={<FaCalculator />}
              onClick={handleParity}
              isLoading={parityLoading}
              fullWidth
            >
              Hesapla
            </Button>
            {parityResult && (
              <div className={styles.resultBox}>
                <span className={styles.resultRate}>
                  1 {parityResult.fromCode} = <strong>{parityResult.rate.toFixed(6)}</strong> {parityResult.toCode}
                </span>
                <span className={styles.resultDesc}>{parityResult.description}</span>
                <span className={styles.resultDate}>
                  Kur tarihi: {new Date(parityResult.rateDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Cross Parity Card */}
        <Card title="Çapraz Parite" subtitle="TRY bazlı çapraz kur hesabı">
          <div className={styles.calcForm}>
            <Select
              label="Kaynak"
              options={currencyOptions}
              value={crossFrom}
              onChange={v => setCrossFrom(String(v))}
              placeholder="Seçiniz..."
            />
            <Select
              label="Hedef"
              options={currencyOptions}
              value={crossTo}
              onChange={v => setCrossTo(String(v))}
              placeholder="Seçiniz..."
            />
            <DateInput
              label="Tarih (opsiyonel)"
              value={crossDate}
              onChange={setCrossDate}
              placeholder="Son kur kullanılır"
            />
            <Button
              variant="primary"
              leftIcon={<FaCalculator />}
              onClick={handleCrossParity}
              isLoading={crossLoading}
              fullWidth
            >
              Hesapla
            </Button>
            {crossResult && (
              <div className={styles.resultBox}>
                <span className={styles.resultRate}>
                  1 {crossResult.fromCode} = <strong>{crossResult.rate.toFixed(6)}</strong> {crossResult.toCode}
                </span>
                <pre className={styles.formulaBreakdown}>{crossResult.formulaBreakdown}</pre>
              </div>
            )}
          </div>
        </Card>

        {/* Conversion Card */}
        <Card title="Tutar Dönüştürme" subtitle="Belirli bir tutarı farklı para birimine çevirin">
          <div className={styles.calcForm}>
            <Input
              label="Miktar"
              type="number"
              placeholder="100.00"
              value={convAmount}
              onChange={e => setConvAmount(e.target.value)}
            />
            <Select
              label="Kaynak"
              options={currencyOptions}
              value={convFrom}
              onChange={v => setConvFrom(String(v))}
              placeholder="Seçiniz..."
            />
            <Select
              label="Hedef"
              options={currencyOptions}
              value={convTo}
              onChange={v => setConvTo(String(v))}
              placeholder="Seçiniz..."
            />
            <Select
              label="Kur Tipi"
              options={RATE_FIELD_OPTIONS}
              value={convRateField}
              onChange={v => setConvRateField(String(v))}
            />
            <DateInput
              label="Tarih (opsiyonel)"
              value={convDate}
              onChange={setConvDate}
              placeholder="Son kur kullanılır"
            />
            <Button
              variant="primary"
              leftIcon={<FaCalculator />}
              onClick={handleConvert}
              isLoading={convLoading}
              fullWidth
            >
              Dönüştür
            </Button>
            {convResult && (
              <div className={styles.resultBox}>
                <span className={styles.resultRate}>
                  {convResult.amount.toLocaleString('tr-TR')} {convResult.fromCode} ={' '}
                  <strong>{convResult.convertedAmount.toFixed(4)}</strong> {convResult.toCode}
                </span>
                <span className={styles.resultDesc}>
                  Kur: 1 {convResult.fromCode} = {convResult.rate.toFixed(6)} {convResult.toCode}
                  {' '}({convResult.rateField})
                </span>
                <span className={styles.resultDate}>
                  Kur tarihi: {new Date(convResult.rateDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};
