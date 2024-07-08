import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import TitleCard from "../../components/Cards/TitleCard";
import CardInput from "../../components/Cards/CardInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../../components/Button";
import BASE_URL_API from "../../config";
import { fetchData, postData } from "../../utils/utils";
import moment from "moment";

const API_URL = `${BASE_URL_API}api/v1/manage-aset/pelihara`;
const API_URL_RENCANA = `${BASE_URL_API}api/v1/manage-aset/rencana`;
const VENDOR_API_URL = `${BASE_URL_API}api/v1/manage-aset/vendor`;

function TambahAset() {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    rencana_id: "",
    kondisi_stlh_perbaikan: "",
    usiaAsetSaatIni: "",
    maksimalUsiaAset: "",
    tahunProduksi: "",
    tanggalPemeliharaanAset: new Date(),
    deskripsiKerusakan: "",
    status_pemeliharaan: "",
    vendorPengelola: "",
    infoVendor: "",
    penanggung_jawab: "",
    deskripsi: "",
    tgl_dilakukan: new Date(),
    waktu_pemeliharaan: "",
  });
  const [asetList, setAsetList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [selectedRencana, setSelectedRencana] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const asetResponse = await fetchData(API_URL_RENCANA);
        setAsetList(asetResponse.data);

        const vendorResponse = await fetchData(VENDOR_API_URL);
        setVendorList(vendorResponse.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        enqueueSnackbar("Gagal memuat data dropdown!", { variant: "error" });
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

  const handleRencanaChange = (event) => {
    const selectedRencanaId = event.target.value;
    const selectedRencana = asetList.find(
      (aset) => aset._id === selectedRencanaId
    );
    if (selectedRencana) {
      setSelectedRencana(selectedRencana);
      setFormData({
        rencana_id: selectedRencana._id,
        kondisi_stlh_perbaikan: selectedRencana.kondisi_aset,
        usiaAsetSaatIni: selectedRencana.usia_aset,
        maksimalUsiaAset: selectedRencana.maks_usia_aset,
        tahunProduksi: selectedRencana.aset.tahun_produksi,
        tanggalPemeliharaanAset: new Date(selectedRencana.tgl_perencanaan),
        deskripsiKerusakan: selectedRencana.deskripsi,
        status_pemeliharaan: "",
        vendorPengelola: selectedRencana.vendor._id,
        infoVendor: selectedRencana.vendor.telp_vendor,
        penanggung_jawab: "",
        deskripsi: "",
        tgl_dilakukan: new Date(),
        waktu_pemeliharaan: "",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formattedData = {
      rencana_id: formData.rencana_id,
      kondisi_stlh_perbaikan: formData.kondisi_stlh_perbaikan,
      status_pemeliharaan: formData.status_pemeliharaan,
      penanggung_jawab: formData.penanggung_jawab,
      deskripsi: formData.deskripsi,
      tgl_dilakukan: moment(formData.tgl_dilakukan).format("DD-MM-YYYY"),
      waktu_pemeliharaan: moment(formData.waktu_pemeliharaan).format("DD-MM-YYYY"),
    };
    try {
      await postData(API_URL, formattedData);
      enqueueSnackbar("Data berhasil disimpan!", { variant: "success" });
    } catch (error) {
      console.error("Error posting data:", error);
      enqueueSnackbar("Gagal menyimpan data!", { variant: "error" });
    }
  };

  return (
    <TitleCard title="Tambah Pemeliharaan Aset" topMargin="mt-2">
      <form onSubmit={handleSubmit}>
        <CardInput title="Identitas Aset">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rencana_id" className="block font-medium">
                Nama Aset *
              </label>
              <select
                id="rencana_id"
                name="rencana_id"
                value={formData.rencana_id}
                onChange={handleRencanaChange}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              >
                <option value="">Pilih rencana aset pemeliharaan</option>
                {asetList &&
                  asetList.length > 0 &&
                  asetList.map((aset) => (
                    <option key={aset._id} value={aset._id}>
                      {aset.aset.nama_aset}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="kondisi_stlh_perbaikan" className="block font-medium">
                Kondisi Aset Setelah Perbaikan *
              </label>
              <select
                id="kondisi_stlh_perbaikan"
                name="kondisi_stlh_perbaikan"
                value={formData.kondisi_stlh_perbaikan}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                readOnly
              >
                <option value="">{formData.kondisi_stlh_perbaikan}</option>
                <option value="Dapat digunakan">Dapat digunakan</option>
                <option value="Dalam Perbaikan">Dalam Perbaikan</option>
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
              <label htmlFor="usiaAsetSaatIni" className="block font-medium">
                Usia Aset Saat Ini *
              </label>
              <input
                type="text"
                id="usiaAsetSaatIni"
                name="usiaAsetSaatIni"
                value={formData.usiaAsetSaatIni}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="maksimalUsiaAset" className="block font-medium">
                Maksimal Usia Aset *
              </label>
              <input
                type="text"
                id="maksimalUsiaAset"
                name="maksimalUsiaAset"
                value={formData.maksimalUsiaAset}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="tahunProduksi" className="block font-medium">
                Tahun Produksi
              </label>
              <input
                type="text"
                id="tahunProduksi"
                name="tahunProduksi"
                value={formData.tahunProduksi}
                readOnly
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
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label
                htmlFor="tanggalPemeliharaanAset"
                className="block font-medium"
              >
                Tanggal Rencana Pemeliharaan *
              </label>
              <DatePicker
                selected={formData.tanggalPemeliharaanAset}
                onChange={(date) =>
                  handleDateChange(date, "tanggalPemeliharaanAset")
                }
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                wrapperClassName="date-picker"
                dateFormat="MMMM d, yyyy"
                readOnly
              />
            </div>
            <div>
              <label htmlFor="statusPemeliharaan" className="block font-medium">
                Status Pemeliharaan
              </label>
              <select
                id="status_pemeliharaan"
                name="status_pemeliharaan"
                value={formData.status_pemeliharaan}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              >
                <option value="">Pilih status pemeliharaan</option>
                <option value="Direncanakan">Direncanakan</option>
                <option value="Dilaksanakan">Dilaksanakan</option>
                <option value="Selesai">Selesai</option>
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
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                readOnly
              >
                <option value="">{formData.vendorPengelola}</option>
                {vendorList &&
                  vendorList.length > 0 &&
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
                readOnly
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
                id="penanggung_jawab"
                name="penanggung_jawab"
                value={formData.penanggung_jawab}
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
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Masukkan deskripsi pemeliharaan"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="tgl_dilakukan" className="block font-medium">
                Tanggal Pemeliharaan Dilakukan
              </label>
              <DatePicker
                selected={formData.tgl_dilakukan}
                onChange={(date) => handleDateChange(date, "tgl_dilakukan")}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                dateFormat="MMMM d, yyyy"
                wrapperClassName="date-picker"
              />
            </div>
            <div>
              <label htmlFor="perkiraanWaktuPemeliharaan" className="block font-medium">
                Perkiraan Waktu Pemeliharaan
              </label>
              <input
                type="text"
                id="waktu_pemeliharaan"
                name="waktu_pemeliharaan"
                value={formData.waktu_pemeliharaan}
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

export default TambahAset;
