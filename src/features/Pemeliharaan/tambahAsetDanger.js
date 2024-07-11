import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import axios from "axios";
import TitleCard from "../../components/Cards/TitleCard";
import CardInput from "../../components/Cards/CardInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../../components/Button";
import BASE_URL_API from "../../config";

// Definisikan BASE_URL_API
const VENDOR_API_URL = `${BASE_URL_API}api/v1/manage-aset/vendor`;
const API_URL_ASSET = `${BASE_URL_API}api/v1/manage-aset/aset?limit=10&page=1`;
const API_URL_POST = `${BASE_URL_API}api/v1/manage-aset/darurat`;

function TambahAsetDanger() {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    namaAset: "",
    usiaAsetSaatIni: "",
    maksimalUsiaAset: "",
    tahunProduksi: "",
    tanggalPemeliharaanAset: new Date(),
    deskripsiKerusakan: "",
    statusPemeliharaan: "",
    vendorPengelola: "",
    infoVendor: "",
    namaPenanggungJawab: "",
    deskripsiPemeliharaan: "",
    tanggalPemeliharaan: new Date(),
    perkiraanWaktuPemeliharaan: "",
    kondisiStlhPerbaikan: "",
  });

  const [asetList, setAsetList] = useState([]);
  const [vendorList, setVendorList] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const asetResponse = await axios.get(API_URL_ASSET);
        console.log("Aset Response:", asetResponse.data); // Tambahkan log untuk memeriksa respons
        setAsetList(asetResponse.data.data || []);

        const vendorResponse = await axios.get(VENDOR_API_URL);
        console.log("Vendor Response:", vendorResponse.data); // Tambahkan log untuk memeriksa respons
        setVendorList(vendorResponse.data.data || []); // Asumsikan data vendor berada di vendorResponse.data.data
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        enqueueSnackbar("Gagal memuat data aset!", { variant: "error" });
      }
    };

    fetchDropdownData();
  }, [enqueueSnackbar]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleAsetChange = (event) => {
    const selectedAsetId = event.target.value;
    const selectedAset = asetList.find((aset) => aset._id === selectedAsetId);
    if (selectedAset) {
      setFormData((prev) => ({
        ...prev,
        namaAset: selectedAsetId,
        usiaAsetSaatIni: "", // This should be fetched from relevant data if available
        maksimalUsiaAset: "", // This should be fetched from relevant data if available
        tahunProduksi: selectedAset.tahun_produksi,
        deskripsiKerusakan: selectedAset.deskripsi_aset,
        vendorPengelola: selectedAset.vendor_id,
        infoVendor: selectedAset.vendor ? selectedAset.vendor.telp_vendor : "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        AsetID: formData.namaAset,
        VendorID: formData.vendorPengelola,
        kondisi_stlh_perbaikan: formData.kondisiStlhPerbaikan,
        status_pemeliharaan: formData.statusPemeliharaan,
        penanggung_jawab: formData.namaPenanggungJawab,
        deskripsi: formData.deskripsiPemeliharaan,
        tgl_dilakukan: formData.tanggalPemeliharaanAset
          .toISOString()
          .split("T")[0],
        waktu_pemeliharaan: formData.perkiraanWaktuPemeliharaan,
      };
      await axios.post(API_URL_POST, payload);
      enqueueSnackbar("Data berhasil disimpan!", { variant: "success" });
    } catch (error) {
      console.error("Error posting data:", error);
      enqueueSnackbar("Gagal menyimpan data!", { variant: "error" });
    }
  };

  return (
    <TitleCard title="Tambah Pemeliharaan Aset Darurat" topMargin="mt-2">
      <form onSubmit={handleSubmit}>
        <CardInput title="Identitas Aset">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="namaAset" className="block font-medium">
                Nama Aset *
              </label>
              <select
                id="namaAset"
                name="namaAset"
                value={formData.namaAset}
                onChange={handleAsetChange}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              >
                <option value="">Pilih aset</option>
                {asetList.map((aset) => (
                  <option key={aset._id} value={aset._id}>
                    {aset.nama_aset}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="kondisiStlhPerbaikan"
                className="block font-medium"
              >
                Kondisi Setelah Perbaikan *
              </label>
              <select
                id="kondisiStlhPerbaikan"
                name="kondisiStlhPerbaikan"
                value={formData.kondisiStlhPerbaikan}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              >
                <option value="">Pilih jenis kondisi aset</option>
                <option value="Dapat digunakan">Dapat digunakan</option>
                <option value="Dalam perbaikan">Dalam Perbaikan</option>
                <option value="Tidak dapat diperbaiki">
                  Tidak dapat diperbaiki
                </option>
              </select>
            </div>
          </div>
        </CardInput>

        <CardInput title="Detail Aset">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tahunProduksi" className="block font-medium">
                Tahun Produksi
              </label>
              <input
                type="text"
                id="tahunProduksi"
                name="tahunProduksi"
                value={formData.tahunProduksi}
                onChange={handleInputChange}
                placeholder="Masukkan tahun produksi"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="deskripsiKerusakan" className="block font-medium">
                Deskripsi Kerusakan
              </label>
              <input
                type="text"
                id="deskripsiKerusakan"
                name="deskripsiKerusakan"
                value={formData.deskripsiKerusakan}
                onChange={handleInputChange}
                placeholder="Masukkan Deskripsi Kerusakan"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label
                htmlFor="tanggalPemeliharaanAset"
                className="block font-medium"
              >
                Tgl Pemeliharaan Aset *
              </label>
              <DatePicker
                selected={formData.tanggalPemeliharaanAset}
                onChange={(date) =>
                  handleDateChange(date, "tanggalPemeliharaanAset")
                }
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                wrapperClassName="date-picker"
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <div>
              <label htmlFor="statusPemeliharaan" className="block font-medium">
                Status Pemeliharaan*
              </label>
              <select
                id="statusPemeliharaan"
                name="statusPemeliharaan"
                value={formData.statusPemeliharaan}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              >
                <option value="">Pilih status pemeliharaan</option>
                <option value="Perbaikan berhasil">Perbaikan berhasil</option>
                <option value="Dalam perbaikan">Dalam perbaikan</option>
                <option value="Tidak dapat diperbaiki">
                  Tidak dapat diperbaiki
                </option>
              </select>
            </div>
          </div>
        </CardInput>

        <CardInput title="Informasi Vendor">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vendorPengelola" className="block font-medium">
                Vendor Pengelola *
              </label>
              <select
                id="vendorPengelola"
                name="vendorPengelola"
                value={formData.vendorPengelola}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              >
                <option value="">Pilih vendor</option>
                {Array.isArray(vendorList) &&
                  vendorList.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.nama_vendor}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="infoVendor" className="block font-medium">
                Informasi vendor / no telepon
              </label>
              <input
                type="text"
                id="infoVendor"
                name="infoVendor"
                value={formData.infoVendor}
                onChange={handleInputChange}
                placeholder="Masukkan informasi vendor"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
          </div>
        </CardInput>

        <CardInput title="Informasi Pemeliharaan">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="namaPenanggungJawab"
                className="block font-medium"
              >
                Nama Penanggung Jawab
              </label>
              <input
                type="text"
                id="namaPenanggungJawab"
                name="namaPenanggungJawab"
                value={formData.namaPenanggungJawab}
                onChange={handleInputChange}
                placeholder="Nama penanggung jawab"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label
                htmlFor="deskripsiPemeliharaan"
                className="block font-medium"
              >
                Deskripsi Pemeliharaan
              </label>
              <input
                type="text"
                id="deskripsiPemeliharaan"
                name="deskripsiPemeliharaan"
                value={formData.deskripsiPemeliharaan}
                onChange={handleInputChange}
                placeholder="Masukkan deskripsi pemeliharaan"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label
                htmlFor="tanggalPemeliharaan"
                className="block font-medium"
              >
                Tanggal Pemeliharaan Dilakukan
              </label>
              <DatePicker
                selected={formData.tanggalPemeliharaan}
                onChange={(date) =>
                  handleDateChange(date, "tanggalPemeliharaan")
                }
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                dateFormat="MMMM d, yyyy"
                wrapperClassName="date-picker"
              />
            </div>
            <div>
              <label
                htmlFor="perkiraanWaktuPemeliharaan"
                className="block font-medium"
              >
                Perkiraan Waktu Pemeliharaan
              </label>
              <input
                type="text"
                id="perkiraanWaktuPemeliharaan"
                name="perkiraanWaktuPemeliharaan"
                value={formData.perkiraanWaktuPemeliharaan}
                onChange={handleInputChange}
                placeholder="Masukkan perkiraan waktu pemeliharaan"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
          </div>
        </CardInput>

        <div className="flex justify-end mt-4">
          <Button label="Simpan" type="submit" />
        </div>
      </form>
    </TitleCard>
  );
}

export default TambahAsetDanger;
