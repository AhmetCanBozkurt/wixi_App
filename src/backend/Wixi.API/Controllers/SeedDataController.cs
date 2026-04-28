using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/admin/ecommerce/seed")]
public class SeedDataController : ControllerBase
{
    private readonly ECommerceDbContext _db;

    public SeedDataController(ECommerceDbContext db) => _db = db;

    [HttpPost]
    public async Task<IActionResult> Seed()
    {
        // Markalar
        var apple = await _db.Brands.FirstOrDefaultAsync(b => b.Slug == "apple");
        if (apple == null) {
            apple = new WixiBrand { Name = "Apple", Slug = "apple" };
            _db.Brands.Add(apple);
        }
        
        var nike = await _db.Brands.FirstOrDefaultAsync(b => b.Slug == "nike");
        if (nike == null) {
            nike = new WixiBrand { Name = "Nike", Slug = "nike" };
            _db.Brands.Add(nike);
        }

        var samsung = await _db.Brands.FirstOrDefaultAsync(b => b.Slug == "samsung");
        if (samsung == null) {
            samsung = new WixiBrand { Name = "Samsung", Slug = "samsung" };
            _db.Brands.Add(samsung);
        }

        var sony = await _db.Brands.FirstOrDefaultAsync(b => b.Slug == "sony");
        if (sony == null) {
            sony = new WixiBrand { Name = "Sony", Slug = "sony" };
            _db.Brands.Add(sony);
        }

        await _db.SaveChangesAsync();

        // Kategoriler
        var electronics = await _db.Categories.FirstOrDefaultAsync(c => c.Slug == "elektronik");
        if (electronics == null) {
            electronics = new WixiCategory { Name = "Elektronik", Slug = "elektronik" };
            _db.Categories.Add(electronics);
        }

        var fashion = await _db.Categories.FirstOrDefaultAsync(c => c.Slug == "giyim-moda");
        if (fashion == null) {
            fashion = new WixiCategory { Name = "Giyim & Moda", Slug = "giyim-moda" };
            _db.Categories.Add(fashion);
        }
        
        await _db.SaveChangesAsync();

        var shoes = await _db.Categories.FirstOrDefaultAsync(c => c.Slug == "ayakkabi");
        if (shoes == null) {
            shoes = new WixiCategory { Name = "Ayakkabı", Slug = "ayakkabi", ParentId = fashion.Id };
            _db.Categories.Add(shoes);
            await _db.SaveChangesAsync();
        }

        // Ürünler
        var dummyProducts = new List<WixiProduct>
        {
            new WixiProduct { Name = "iPhone 15 Pro Max", Slug = "iphone-15-pro-max", BasePrice = 84999, CategoryId = electronics.Id, BrandId = apple.Id, ShortDescription = "Titanyum tasarım, A17 Pro çip.", Description = "En güçlü iPhone modeli.", Media = new List<WixiProductMedia> { new WixiProductMedia { Url = "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800", SortOrder = 0 } } },
            new WixiProduct { Name = "MacBook Air M3", Slug = "macbook-air-m3", BasePrice = 45999, CategoryId = electronics.Id, BrandId = apple.Id, ShortDescription = "Dünyanın en popüler dizüstü bilgisayarı.", Media = new List<WixiProductMedia> { new WixiProductMedia { Url = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800", SortOrder = 0 } } },
            new WixiProduct { Name = "Nike Air Force 1 '07", Slug = "nike-air-force-1", BasePrice = 3699, CategoryId = shoes.Id, BrandId = nike.Id, ShortDescription = "Efsanevi stil, rahat yastıklama.", Media = new List<WixiProductMedia> { new WixiProductMedia { Url = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800", SortOrder = 0 } } },
            new WixiProduct { Name = "Sony WH-1000XM5", Slug = "sony-wh-1000xm5", BasePrice = 12499, CategoryId = electronics.Id, BrandId = sony.Id, ShortDescription = "Sektör lideri gürültü engelleme.", Media = new List<WixiProductMedia> { new WixiProductMedia { Url = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800", SortOrder = 0 } } },
            new WixiProduct { Name = "Samsung Galaxy S24 Ultra", Slug = "samsung-s24-ultra", BasePrice = 69999, CategoryId = electronics.Id, BrandId = samsung.Id, ShortDescription = "Galaxy AI ile yapay zeka deneyimi.", Media = new List<WixiProductMedia> { new WixiProductMedia { Url = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800", SortOrder = 0 } } }
        };

        foreach (var p in dummyProducts)
        {
            if (!await _db.Products.AnyAsync(x => x.Slug == p.Slug))
            {
                _db.Products.Add(p);
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Örnek veriler kontrol edildi ve eksikler tamamlandı!" });
    }
}
