'use client';
import { useState, useEffect } from 'react';
import { locationService, Province, Ward } from '@/lib/locationService';

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  placeholder = "Chọn địa điểm",
  className = ""
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [useManualInput, setUseManualInput] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProvinces();
  }, []);

  useEffect(() => {
    // Nếu có giá trị ban đầu và không phải từ dropdown, set manual input
    if (value && !selectedProvince && !selectedWard) {
      setManualInput(value);
      setUseManualInput(true);
    }
  }, [value]);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (err) {
      setError('Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedWard('');
    setWards([]);
    setUseManualInput(false);
    onChange('');

    if (provinceId) {
      try {
        const data = await locationService.getWards(provinceId);
        setWards(data);
      } catch (err) {
        setError('Không thể tải danh sách phường/xã');
      }
    }
  };

  const handleWardChange = async (wardId: string) => {
    setSelectedWard(wardId);
    setUseManualInput(false);
    
    if (wardId && selectedProvince) {
      try {
        const fullLocation = await locationService.getFullLocation(selectedProvince, wardId);
        onChange(fullLocation);
      } catch (err) {
        setError('Không thể tạo địa chỉ đầy đủ');
      }
    }
  };

  const handleManualInputChange = (inputValue: string) => {
    setManualInput(inputValue);
    setUseManualInput(true);
    setSelectedProvince('');
    setSelectedWard('');
    onChange(inputValue);
  };

  const handleInputTypeChange = (useManual: boolean) => {
    setUseManualInput(useManual);
    if (useManual) {
      setSelectedProvince('');
      setSelectedWard('');
      onChange(manualInput);
    } else {
      setManualInput('');
      onChange('');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Toggle giữa dropdown và nhập thủ công */}
      <div className="flex space-x-4 mb-3">
        <label className="flex items-center">
          <input
            type="radio"
            name="inputType"
            checked={!useManualInput}
            onChange={() => handleInputTypeChange(false)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Chọn từ danh sách</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="inputType"
            checked={useManualInput}
            onChange={() => handleInputTypeChange(true)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Nhập thủ công</span>
        </label>
      </div>
      
      {!useManualInput ? (
        // Dropdown chọn tỉnh thành
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tỉnh/Thành phố *
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="">{loading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProvince && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phường/Xã *
              </label>
              <select
                value={selectedWard}
                onChange={(e) => handleWardChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Chọn phường/xã</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      ) : (
        // Input nhập thủ công
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Địa điểm *
          </label>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => handleManualInputChange(e.target.value)}
            placeholder="Nhập địa điểm thủ công"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      )}

      {value && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800 font-medium">Địa điểm đã chọn:</p>
          <p className="text-sm text-green-700">{value}</p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 