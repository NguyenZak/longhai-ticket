interface Location {
  id: string;
  name: string;
  type: string;
  parent_id?: string;
}

interface Province extends Location {
  type: 'province';
  wards: Ward[];
}

interface Ward extends Location {
  type: 'ward';
  province_id: string;
}

class LocationService {
  private data: any[] = [];
  private cache: Map<string, any> = new Map();

  async loadData(): Promise<void> {
    if (this.data.length > 0) return;

    try {
      const response = await fetch('/data/data.json');
      if (!response.ok) {
        throw new Error('Failed to load location data');
      }
      this.data = await response.json();
    } catch (error) {
      console.error('Error loading location data:', error);
      this.data = [];
    }
  }

  async getProvinces(): Promise<Province[]> {
    await this.loadData();
    
    const cacheKey = 'provinces';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const provinces = this.data.map(province => ({
      id: province.province_code,
      name: province.name,
      type: 'province' as const,
      wards: province.wards.map((ward: any) => ({
        id: ward.ward_code,
        name: ward.name,
        type: 'ward' as const,
        province_id: ward.province_code
      }))
    }));

    this.cache.set(cacheKey, provinces);
    return provinces;
  }

  async getWards(provinceId: string): Promise<Ward[]> {
    await this.loadData();
    
    const cacheKey = `wards_${provinceId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const province = this.data.find(p => p.province_code === provinceId);
    if (!province) {
      return [];
    }

    const wards = province.wards.map((ward: any) => ({
      id: ward.ward_code,
      name: ward.name,
      type: 'ward' as const,
      province_id: ward.province_code
    }));

    this.cache.set(cacheKey, wards);
    return wards;
  }

  async getFullLocation(provinceId: string, wardId: string): Promise<string> {
    try {
      const [provinces, wards] = await Promise.all([
        this.getProvinces(),
        this.getWards(provinceId)
      ]);

      const province = provinces.find(p => p.id === provinceId);
      const ward = wards.find(w => w.id === wardId);

      if (!province || !ward) {
        return '';
      }

      return `${ward.name}, ${province.name}`;
    } catch (error) {
      console.error('Error getting full location:', error);
      return '';
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const locationService = new LocationService();
export type { Province, Ward, Location }; 