import React, { useState } from 'react';
import { Button, Input, Card, DateInput, AdvancedDataTable, Badge, Select, Switch, ImageUpload, ComboBox, Modal } from '../../shared/ui';
import styles from './ComponentShowcasePage.module.css';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import logoSrc from '../../assets/Logolar/logo.png';
import { 
    FaLock, FaUser, FaGithub, FaGoogle, FaChartLine, 
    FaUsers, FaArrowUp, FaEllipsisH, FaCog
} from 'react-icons/fa';

type TabType = 'components' | 'layouts' | 'advanced-table';
type LayoutType = 'login' | 'dashboard';

const MOCK_DATA = [
    { id: '1', name: 'Ahmet Can Bozkurt', email: 'ahmet@wixi.com', role: 'Admin', status: 'Aktif', date: '2026-04-10' },
    { id: '2', name: 'Mehmet Yılmaz', email: 'mehmet@test.com', role: 'User', status: 'Aktif', date: '2026-04-11' },
    { id: '3', name: 'Ayşe Demir', email: 'ayse@example.com', role: 'Manager', status: 'Beklemede', date: '2026-04-09' },
    { id: '4', name: 'Canberk Oz', email: 'canberk@wixi.com', role: 'Admin', status: 'Aktif', date: '2026-04-08' },
    { id: '5', name: 'Selin Su', email: 'selin@test.com', role: 'User', status: 'Aktif', date: '2026-04-07' },
    { id: '6', name: 'Burak Tan', email: 'burak@example.com', role: 'User', status: 'Pasif', date: '2026-04-06' },
    { id: '7', name: 'Derya Göz', email: 'derya@wixi.com', role: 'Manager', status: 'Aktif', date: '2026-04-05' },
];

export const ComponentShowcasePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('components');
    const [activeLayout, setActiveLayout] = useState<LayoutType>('login');
  const [selectedDate, setSelectedDate] = useState('2026-04-11');
  const [userRole, setUserRole] = useState<string | number>('admin');
  const [errorStatus, setErrorStatus] = useState<string | number>('');
  const [selectedCountry, setSelectedCountry] = useState<string | number>('tr');
  const [isLargeModalOpen, setIsLargeModalOpen] = useState(false);

  const handleTestToast = () => {
    toast.success('İşlem başarıyla tamamlandı!', {
      style: { 
        background: 'var(--bg-secondary)', 
        color: 'var(--text-main)', 
        border: '1px solid var(--color-success)' 
      }
    });
  };

  const handleTestSwal = () => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu işlemi geri alamazsınız!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonColor: 'var(--color-danger)',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal',
      background: 'var(--bg-secondary)',
      color: 'var(--text-main)',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: styles.swalPopup
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
            title: 'Silindi!',
            text: 'Veri başarıyla silindi.',
            icon: 'success',
            background: 'var(--bg-secondary)',
            color: 'var(--text-main)'
        });
      }
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="textGradient">UI & Layout Showcase</h1>
        <p>WIXI Platformu premium tasarım standartları ve örnek sayfa yapıları.</p>
        
        <div className={styles.tabSwitcher}>
            <button 
                className={`${styles.tabBtn} ${activeTab === 'components' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('components')}
            >
                UI Components
            </button>
            <button 
                className={`${styles.tabBtn} ${activeTab === 'layouts' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('layouts')}
            >
                Page Layouts
            </button>
            <button 
                className={`${styles.tabBtn} ${activeTab === 'advanced-table' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('advanced-table')}
            >
                Advanced Table
            </button>
        </div>
      </header>

      {activeTab === 'components' && (
        <div className={styles.tabContent}>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Buttons (Atoms)</h2>
                <div className={styles.grid}>
                <Card title="Variants" subtitle="Farklı renk ve stil seçenekleri">
                    <div className={styles.flexGroup}>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="glass">Glassmorphism</Button>
                    <Button variant="ghost">Ghost</Button>
                    </div>
                </Card>

                <Card title="States & Sizes" subtitle="Yüklenme, pasif ve boyut özellikleri">
                    <div className={styles.flexGroup}>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button isLoading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    </div>
                </Card>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Badges (Atoms)</h2>
                <Card title="Badge Showcase" subtitle="Durum göstergeleri ve etiketler">
                    <div className={styles.badgeShowcase}>
                        <div className={styles.badgeRow}>
                            <h4>Variants</h4>
                            <div className={styles.flexGroup}>
                                <Badge variant="default">Default</Badge>
                                <Badge variant="primary">Primary</Badge>
                                <Badge variant="success">Success</Badge>
                                <Badge variant="warning">Warning</Badge>
                                <Badge variant="danger">Danger</Badge>
                                <Badge variant="info">Info</Badge>
                            </div>
                        </div>

                        <div className={styles.badgeRow}>
                            <h4>With Dot</h4>
                            <div className={styles.flexGroup}>
                                <Badge variant="success" showDot>Active</Badge>
                                <Badge variant="warning" showDot>Pending</Badge>
                                <Badge variant="danger" showDot>Offline</Badge>
                            </div>
                        </div>

                        <div className={styles.badgeRow}>
                            <h4>Sizes</h4>
                            <div className={styles.flexGroup}>
                                <Badge size="sm" variant="primary">Small</Badge>
                                <Badge size="md" variant="primary">Medium</Badge>
                                <Badge size="lg" variant="primary">Large</Badge>
                            </div>
                        </div>

                        <div className={styles.badgeRow}>
                            <h4>Outline</h4>
                            <div className={styles.flexGroup}>
                                <Badge outline variant="default">Default</Badge>
                                <Badge outline variant="success">Success</Badge>
                                <Badge outline variant="warning">Warning</Badge>
                                <Badge outline variant="danger">Danger</Badge>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Inputs & Date (Atoms)</h2>
                <Card title="Form Elements" subtitle="Kullanıcı giriş bileşenleri">
                <div className={styles.inputGrid}>
                    <Input label="Email Adresi" placeholder="example@wixi.com" leftIcon={<FaUser size={14} />} required />
                    <Input label="Şifre" type="password" placeholder="••••••••" leftIcon={<FaLock size={14} />} required />
                    <DateInput label="Doğum Tarihi" value={selectedDate} onChange={setSelectedDate} required />
                </div>
                </Card>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Asset Management (Molecules)</h2>
                <div className={styles.grid}>
                    <Card title="Image Upload" subtitle="Profil ve görsel yükleme">
                        <div className={styles.flexGroup}>
                            <ImageUpload label="Profil Resmi" shape="circle" size={100} />
                            <ImageUpload label="Kapak Görseli" shape="square" size={150} hint="1200x400 önerilir." />
                        </div>
                    </Card>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Selection & Toggles (Atoms)</h2>
                <div className={styles.grid}>
                    <Card title="Dropdowns" subtitle="Select bileşeni ve varyasyonları">
                        <div className={styles.inputGrid}>
                            <Select 
                                label="Kullanıcı Rolü" 
                                value={userRole}
                                onChange={setUserRole}
                                options={[
                                    { label: 'Admin', value: 'admin' },
                                    { label: 'Editör', value: 'editor' },
                                    { label: 'İzleyici', value: 'viewer' }
                                ]} 
                                leftIcon={<FaUsers size={14} />}
                            />
                            <Select 
                                label="Hata Durumu" 
                                value={errorStatus}
                                onChange={setErrorStatus}
                                options={[{ label: 'Lütfen seçin', value: '' }, { label: 'Hata var', value: 'err' }]} 
                                error={errorStatus === 'err' ? "Geçersiz seçim" : undefined}
                            />
                            <ComboBox 
                                label="Searchable Dropdown"
                                placeholder="Ülke ara..."
                                value={selectedCountry}
                                onChange={setSelectedCountry}
                                options={[
                                    { label: 'Türkiye', value: 'tr' },
                                    { label: 'Amerika', value: 'us' },
                                    { label: 'Almanya', value: 'de' },
                                    { label: 'Fransa', value: 'fr' },
                                    { label: 'İngiltere', value: 'uk' }
                                ]}
                            />
                        </div>
                    </Card>

                    <Card title="Switches" subtitle="Modern toggle bileşenleri">
                        <div className={styles.flexColumn} style={{ gap: '20px' }}>
                            <Switch label="Bildirimleri Aç" description="E-posta ve push bildirimleri gönderilir." defaultChecked />
                            <Switch label="Karanlık Mod" description="Arayüz rengini gece moduna çevirir." />
                            <Switch label="Bakım Modu" description="Sistemi geçici olarak dışarıya kapatır." disabled />
                        </div>
                    </Card>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Modals & Notifications</h2>
                <Card title="Interactions" subtitle="Global mesajlaşma sistemleri">
                <div className={styles.flexGroup}>
                    <Button variant="primary" onClick={handleTestToast}>Toast Mesajı Göster</Button>
                    <Button variant="danger" onClick={handleTestSwal}>SweetAlert2 Onay Kutusu</Button>
                    <Button variant="glass" onClick={() => setIsLargeModalOpen(true)}>Large Modal Penceresi</Button>
                </div>
                </Card>
            </section>

            <Modal 
                isOpen={isLargeModalOpen} 
                onClose={() => setIsLargeModalOpen(false)}
                title="Premium Modal Yapısı"
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsLargeModalOpen(false)}>Vazgeç</Button>
                        <Button variant="primary" onClick={() => { toast.success('Kaydedildi'); setIsLargeModalOpen(false); }}>Değişiklikleri Kaydet</Button>
                    </>
                }
            >
                <div className={styles.modalInnerContent}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <ImageUpload label="Sistem Logosu" shape="square" size={100} required />
                    </div>

                    <div className={styles.sectionHeader} style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>Genel Bilgiler</h4>
                    </div>
                    
                    <div className={styles.inputGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <Input label="Uygulama Adı" placeholder="Wixi Core Pro" required />
                        <Input label="Yönetici E-posta" placeholder="admin@wixi.com" required leftIcon={<FaUser size={12} />} />
                        <DateInput label="Kurulum Tarihi" value={selectedDate} onChange={setSelectedDate} required />
                    </div>

                    <div className={styles.sectionHeader} style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>Sunucu ve Veritabanı</h4>
                    </div>

                    <div className={styles.inputGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <Input label="Sunucu IP Adresi" placeholder="192.168.1.100" required />
                        <Select 
                            label="Sunucu Bölgesi" 
                            options={[{label: 'Avrupa (Frankfurt)', value: 'eu-central-1'}, {label: 'Asya (İstanbul)', value: 'tr-east-1'}]} 
                            required 
                        />
                        <ComboBox 
                            label="Birincil Veritabanı" 
                            value="pg" 
                            options={[
                                {label: 'PostgreSQL 15', value: 'pg'}, 
                                {label: 'MongoDB 6.0', value: 'mongo'},
                                {label: 'Redis Cache', value: 'redis'}
                            ]} 
                            required 
                        />
                    </div>

                    <div className={styles.sectionHeader} style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>Güvenlik ve Tercihler</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Switch label="İki Faktörlü Doğrulama" description="Giriş yaparken ek güvenlik katmanı sağlar." defaultChecked />
                        <Switch label="Otomatik Bakım Modu" description="Her hafta sonu sistemi güncellemelere açar." />
                        <Switch label="Hata Kayıtlarını Tut" description="Kritik hataları veritabanına loglar." defaultChecked />
                    </div>
                </div>
            </Modal>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Cards (Molecules)</h2>
                <div className={styles.grid}>
                <Card 
                    title="Premium Card" 
                    subtitle="Glassmorphism destekli standart kart"
                    hoverable
                    footer={<Button size="sm" fullWidth variant="glass">Footer Action</Button>}
                >
                    <p style={{ color: 'var(--text-muted)' }}>
                    Bu kart bileşeni, tema dosyasındaki standartlara göre tasarlanmıştır. 
                    Hover durumunda yükselme ve neon parlama efekti içerir.
                    </p>
                </Card>

                <Card title="Simple Content" hoverable>
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀</div>
                        <h4>Hız ve Performans</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>FSD mimarisi ve Vanilla CSS ile maksimum hız.</p>
                    </div>
                </Card>
                </div>
            </section>
        </div>
      )}

      {activeTab === 'layouts' && (
        <div className={styles.tabContent}>
            <div className={styles.layoutSwitcher}>
                <span 
                    className={activeLayout === 'login' ? styles.layoutActive : ''} 
                    onClick={() => setActiveLayout('login')}
                >
                    Login Page
                </span>
                <span 
                    className={activeLayout === 'dashboard' ? styles.layoutActive : ''} 
                    onClick={() => setActiveLayout('dashboard')}
                >
                    Admin Dashboard
                </span>
            </div>

            <section className={styles.layoutSection}>
                <div className={styles.mockBrowser}>
                    <div className={styles.browserHeader}>
                        <div className={styles.browserDots}><span /><span /><span /></div>
                        <div className={styles.browserUrl}>
                            {activeLayout === 'login' ? 'wixi.platform / auth / login' : 'wixi.platform / dashboard'}
                        </div>
                    </div>
                    
                    {activeLayout === 'login' ? (
                        <div className={styles.loginLayoutDemo}>
                            <div className={styles.loginCard}>
                                <div className={styles.loginHeader}>
                                    <img src={logoSrc} alt="Logo" className={styles.loginLogo} />
                                    <h2 className="textGradient">WIXI Platform</h2>
                                    <p>Geleceğin modüler iş yönetim sistemine hoş geldiniz.</p>
                                </div>

                                <form className={styles.loginForm} onSubmit={e => e.preventDefault()}>
                                    <Input label="E-Posta" placeholder="E-posta adresiniz" leftIcon={<FaUser size={14} />} />
                                    <Input label="Şifre" type="password" placeholder="Parolanız" leftIcon={<FaLock size={14} />} />
                                    
                                    <div className={styles.loginOptions}>
                                        <label className={styles.remember}>
                                            <input type="checkbox" /> Beni Hatırla
                                        </label>
                                        <span className={styles.forgot}>Şifremi Unuttum</span>
                                    </div>

                                    <Button fullWidth size="lg">Giriş Yap</Button>

                                    <div className={styles.divider}><span>veya</span></div>

                                    <div className={styles.socialLogins}>
                                        <Button variant="glass" fullWidth leftIcon={<FaGoogle />}>Google</Button>
                                        <Button variant="glass" fullWidth leftIcon={<FaGithub />}>GitHub</Button>
                                    </div>
                                </form>
                            </div>
                            <div className={styles.loginDecor}>
                                <div className={styles.decorCircle1}></div>
                                <div className={styles.decorCircle2}></div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.dashboardLayoutDemo}>
                            <aside className={styles.miniSidebar}>
                                <img src={logoSrc} alt="L" className={styles.miniLogo} />
                                <div className={styles.miniIcons}>
                                    <div className={styles.miniIconActive}><FaChartLine /></div>
                                    <div><FaUsers /></div>
                                    <div><FaCog /></div>
                                </div>
                            </aside>
                            <main className={styles.dashboardMain}>
                                <header className={styles.dashboardTitle}>
                                    <h3>Dashboard Overview</h3>
                                    <div className={styles.userCircle}>A</div>
                                </header>
                                <div className={styles.statGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statHeader}>
                                            <span className={styles.statLabel}>Total Sales</span>
                                            <FaEllipsisH />
                                        </div>
                                        <div className={styles.statValue}>$45,285</div>
                                        <div className={styles.statTrend}><FaArrowUp /> +12.5%</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statHeader}>
                                            <span className={styles.statLabel}>Active Users</span>
                                            <FaEllipsisH />
                                        </div>
                                        <div className={styles.statValue}>2,482</div>
                                        <div className={styles.statTrend}><FaArrowUp /> +4.2%</div>
                                    </div>
                                </div>
                                <div className={styles.chartSample}>
                                    <div className={styles.chartBar} style={{ height: '40%' }}></div>
                                    <div className={styles.chartBar} style={{ height: '60%' }}></div>
                                    <div className={styles.chartBar} style={{ height: '50%' }}></div>
                                    <div className={styles.chartBar} style={{ height: '80%' }}></div>
                                    <div className={styles.chartBar} style={{ height: '55%' }}></div>
                                    <div className={styles.chartBar} style={{ height: '70%' }}></div>
                                </div>
                            </main>
                        </div>
                    )}
                </div>
                
                <div className={styles.layoutInfo}>
                    <h3>{activeLayout === 'login' ? 'Login Global Layout' : 'Admin Dashboard Layout'}</h3>
                    <p>
                        {activeLayout === 'login' 
                            ? 'Merkezi kimlik doğrulama süreçleri için tasarlanmış temiz, odaklayıcı ve premium bir yapı.' 
                            : 'Performans odaklı, hızlı erişim menüleri ve görselleştirilmiş veri kartları içeren ana panel yapısı.'}
                    </p>
                    <ul>
                        <li>Vantuz (Glassmorphism) efektli bileşenler</li>
                        <li>Dinamik arka plan ve geçiş animasyonları</li>
                        <li>Veri odaklı (Data-Driven) tasarım dili</li>
                    </ul>
                </div>
            </section>
        </div>
      )}

      {activeTab === 'advanced-table' && (
        <div className={styles.tabContent}>
            <section className={styles.section}>
                <div className={styles.tableHeaderInfo}>
                    <h2 className={styles.sectionTitle}>Advanced Data Table</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Filtreleme, sıralama, pagination ve dinamik sütun yönetimi içeren kurumsal seviye tablo yapısı.
                    </p>
                </div>
                
                <Card padding="none">
                    <AdvancedDataTable 
                        dataSource={MOCK_DATA}
                        columns={[
                            { field: 'id', title: 'ID', width: 80 },
                            { 
                                field: 'name', title: 'Ad Soyad',
                                template: (row) => (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Badge variant="primary" outline size="sm">{row.name.charAt(0)}</Badge>
                                        <span>{row.name}</span>
                                    </div>
                                )
                            },
                            { field: 'email', title: 'E-Posta' },
                            { field: 'role', title: 'Rol', template: (row) => <Badge variant="info" size="sm" outline>{row.role}</Badge> },
                            { field: 'status', title: 'Durum', template: (row) => <Badge variant={row.status === 'Aktif' ? 'success' : 'warning'} showDot size="sm">{row.status}</Badge> },
                            { field: 'date', title: 'Tarih' }
                        ]}
                        groupable={true}
                        sortable={true}
                        selectable={true}
                        pageable={{ pageSize: 10 }}
                        toolbar={['search', 'excel', 'pdf']}
                    />
                </Card>
            </section>
        </div>
      )}
    </div>
  );
};
