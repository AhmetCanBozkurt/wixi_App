/**
 * Uygulama Mesajları
 * 
 * Tüm kullanıcıya gösterilen mesajlar burada merkezi olarak tanımlanır.
 * Toast, alert ve hata mesajları için bu sabitleri kullanın.
 * 
 * @example
 * import { MESSAGES } from '@/constants/messages';
 * toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);
 */

export const MESSAGES = {
    // Kimlik Doğrulama
    AUTH: {
        LOGIN_SUCCESS: 'Başarıyla giriş yapıldı',
        LOGIN_ERROR: 'Giriş yapılırken bir hata oluştu',
        LOGOUT_SUCCESS: 'Başarıyla çıkış yapıldı',
        LOGOUT_ERROR: 'Çıkış yapılırken bir hata oluştu',
        REGISTER_SUCCESS: 'Başarıyla kayıt olundu',
        REGISTER_ERROR: 'Kayıt olurken bir hata oluştu',
        SESSION_EXPIRED: 'Oturumunuz sona erdi, lütfen tekrar giriş yapın',
        UNAUTHORIZED: 'Bu işlem için yetkiniz yok',
        INVALID_CREDENTIALS: 'Geçersiz kullanıcı adı veya şifre',
    },

    // Şifre İşlemleri
    PASSWORD: {
        RESET_REQUEST_SUCCESS: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
        RESET_REQUEST_ERROR: 'Şifre sıfırlama isteği gönderilirken bir hata oluştu',
        RESET_SUCCESS: 'Şifreniz başarıyla sıfırlandı',
        RESET_ERROR: 'Şifre sıfırlanırken bir hata oluştu',
        MISMATCH: 'Şifreler eşleşmiyor',
    },

    // Lisans
    LICENSE: {
        VALID: 'Lisans geçerli',
        INVALID: 'Lisans geçersiz',
        EXPIRED: 'Lisansınızın süresi dolmuş',
        VALIDATION_SUCCESS: 'Lisans başarıyla doğrulandı',
        VALIDATION_ERROR: 'Lisans doğrulanırken bir hata oluştu',
        NOT_FOUND: 'Lisans bulunamadı',
        CHECKING: 'Lisans kontrol ediliyor...',
    },

    // CRUD İşlemleri
    CRUD: {
        CREATE_SUCCESS: 'Başarıyla oluşturuldu',
        CREATE_ERROR: 'Oluşturulurken bir hata oluştu',
        UPDATE_SUCCESS: 'Başarıyla güncellendi',
        UPDATE_ERROR: 'Güncellenirken bir hata oluştu',
        DELETE_SUCCESS: 'Başarıyla silindi',
        DELETE_ERROR: 'Silinirken bir hata oluştu',
        SAVE_SUCCESS: 'Değişiklikler kaydedildi',
        SAVE_ERROR: 'Kaydedilirken bir hata oluştu',
        LOAD_ERROR: 'Veriler yüklenirken bir hata oluştu',
    },

    // Form
    FORM: {
        REQUIRED_FIELD: 'Bu alan zorunludur',
        INVALID_EMAIL: 'Geçerli bir e-posta adresi girin',
        INVALID_PHONE: 'Geçerli bir telefon numarası girin',
        MIN_LENGTH: (min: number) => `En az ${min} karakter olmalıdır`,
        MAX_LENGTH: (max: number) => `En fazla ${max} karakter olabilir`,
        SUBMIT_SUCCESS: 'Form başarıyla gönderildi',
        SUBMIT_ERROR: 'Form gönderilirken bir hata oluştu',
    },

    // Dosya İşlemleri
    FILE: {
        UPLOAD_SUCCESS: 'Dosya başarıyla yüklendi',
        UPLOAD_ERROR: 'Dosya yüklenirken bir hata oluştu',
        DELETE_SUCCESS: 'Dosya başarıyla silindi',
        DELETE_ERROR: 'Dosya silinirken bir hata oluştu',
        SIZE_ERROR: 'Dosya boyutu çok büyük',
        TYPE_ERROR: 'Desteklenmeyen dosya türü',
    },

    // Genel
    GENERAL: {
        SUCCESS: 'İşlem başarılı',
        ERROR: 'Bir hata oluştu',
        NETWORK_ERROR: 'Bağlantı hatası, lütfen internet bağlantınızı kontrol edin',
        SERVER_ERROR: 'Sunucu hatası, lütfen daha sonra tekrar deneyin',
        LOADING: 'Yükleniyor...',
        NO_DATA: 'Veri bulunamadı',
        CONFIRM_DELETE: 'Silmek istediğinizden emin misiniz?',
        CONFIRM_ACTION: 'Bu işlemi onaylıyor musunuz?',
    },
} as const;

// Toast için hazır fonksiyonlar
export const TOAST_MESSAGES = {
    success: (title: string, description?: string) => ({
        variant: 'default' as const,
        title: `✅ ${title}`,
        description,
    }),
    error: (title: string, description?: string) => ({
        variant: 'destructive' as const,
        title: `❌ ${title}`,
        description,
    }),
    warning: (title: string, description?: string) => ({
        variant: 'default' as const,
        title: `⚠️ ${title}`,
        description,
    }),
    info: (title: string, description?: string) => ({
        variant: 'default' as const,
        title: `ℹ️ ${title}`,
        description,
    }),
} as const;

export default MESSAGES;
