import { useState, useEffect } from "react";
import moment from "moment";
import { useSnackbar } from "notistack";
import TitleCard from "../../components/Cards/TitleCard";
import CardInput from "../../components/Cards/CardInput";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ConfirmDialog from "../../components/Dialog/ConfirmDialog";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../../components/Button";
import BASE_URL_API from "../../config";
import { fetchData, updateData, deleteData } from "../../utils/utils";

const API_URL = `${BASE_URL_API}api/v1/manage-aset/pelihara`;
const API_URL_RENCANA = `${BASE_URL_API}api/v1/manage-aset/rencana`;
const VENDOR_API_URL = `${BASE_URL_API}api/v1/manage-aset/vendor`;
const ITEMS_PER_PAGE = 10;

function PemeliharaanAset() {
  const [assets, setAssets] = useState([]);
  const [asetList, setAsetList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "",
    id: null,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
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
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchAssets();
    fetchAsetList();
    fetchVendorList();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchAssets = async () => {
    try {
      const response = await fetchData(API_URL);
      const dataDarurat = response.data_darurat ? response.data_darurat.map((item) => ({
        ...item,
        status: "Data Darurat",
      })) : [];
      const dataPemeliharaan = response.data_pemeliharaan ? response.data_pemeliharaan.map((item) => ({
        ...item,
        status: "Data Pemeliharaan",
      })) : [];
      const allAssets = [...dataDarurat, ...dataPemeliharaan];
      allAssets.sort((a, b) => new Date(b.tgl_dilakukan) - new Date(a.tgl_dilakukan));
      setAssets(allAssets);
      setTotalPages(Math.ceil(allAssets.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Fetching error:", error.message);
    }
  };

  const fetchAsetList = async () => {
    try {
      const response = await fetchData(API_URL_RENCANA);
      setAsetList(response.data);
    } catch (error) {
      console.error("Error fetching aset list:", error);
    }
  };

  const fetchVendorList = async () => {
    try {
      const response = await fetchData(VENDOR_API_URL);
      setVendorList(response.data);
    } catch (error) {
      console.error("Error fetching vendor list:", error);
    }
  };

  const handleDeleteAsset = (id) => {
    setModal({
      isOpen: true,
      message: "Apakah Anda yakin ingin menghapus aset ini?",
      type: "delete",
      id,
    });
  };

  const handleEditAsset = (asset) => {
    const selectedRencana = asetList.find(aset => aset._id === asset.rencana_id);
    if (selectedRencana) {
      setEditFormData({
        rencana_id: asset.rencana_id,
        kondisi_stlh_perbaikan: asset.kondisi_stlh_perbaikan,
        usiaAsetSaatIni: selectedRencana.usia_aset,
        maksimalUsiaAset: selectedRencana.maks_usia_aset,
        tahunProduksi: selectedRencana.aset.tahun_produksi,
        tanggalPemeliharaanAset: new Date(selectedRencana.tgl_perencanaan),
        deskripsiKerusakan: selectedRencana.deskripsi,
        status_pemeliharaan: asset.status_pemeliharaan,
        vendorPengelola: selectedRencana.vendor._id,
        infoVendor: selectedRencana.vendor.telp_vendor,
        penanggung_jawab: asset.penanggung_jawab,
        deskripsi: asset.deskripsi,
        tgl_dilakukan: moment(asset.tgl_dilakukan, "YYYY-MM-DD").toDate(),
        waktu_pemeliharaan: asset.waktu_pemeliharaan,
      });
      setIsEditModalOpen(true);
    }
  };

  const closeDialog = () => {
    setModal({ isOpen: false, id: null });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteData(`${API_URL}/${modal.id}`);
      setAssets(assets.filter((asset) => asset._id !== modal.id));
      enqueueSnackbar("Aset berhasil dihapus.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Gagal menghapus aset.", { variant: "error" });
    }
    closeDialog();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleDateChange = (date, name) => {
    setEditFormData({ ...editFormData, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      rencana_id: editFormData.rencana_id,
      kondisi_stlh_perbaikan: editFormData.kondisi_stlh_perbaikan,
      status_pemeliharaan: editFormData.status_pemeliharaan,
      penanggung_jawab: editFormData.penanggung_jawab,
      deskripsi: editFormData.deskripsi,
    };
    try {
      await updateData(`${API_URL}/${editFormData.rencana_id}`, formattedData);
      fetchAssets();
      enqueueSnackbar("Data berhasil diperbarui!", { variant: "success" });
      closeEditModal();
    } catch (error) {
      enqueueSnackbar("Gagal memperbarui data!", { variant: "error" });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const filteredAssets = assets.filter(
    (asset) =>
      (filterStatus === "All" || asset.status === filterStatus) &&
      ((asset.rencana_id &&
        asset.rencana_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (asset.kondisi_stlh_perbaikan &&
          asset.kondisi_stlh_perbaikan
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (asset.status_pemeliharaan &&
          asset.status_pemeliharaan
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (asset.penanggung_jawab &&
          asset.penanggung_jawab
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (asset.deskripsi &&
          asset.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <TitleCard title="Detail Pemeliharaan Aset" topMargin="mt-2">
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Cari aset..."
            className="input input-bordered w-full max-w-xs"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="select select-bordered"
          >
            <option value="All">Semua Status</option>
            <option value="Data Pemeliharaan">Data Pemeliharaan</option>
            <option value="Data Darurat">Data Darurat</option>
          </select>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nama Aset</th>
                <th>Tanggal Pemeliharaan</th>
                <th>Vendor Pengelola</th>
                <th>Penanggung Jawab</th>
                <th>Aset Setelah Perbaikan</th>
                <th>Status Perbaikan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.map((asset) => (
                <tr key={asset._id}>
                  <td>{asset.aset.nama_aset}</td>
                  <td>{moment(asset.tgl_dilakukan).format("DD MMM YYYY")}</td>
                  <td>{asset.vendor.nama_vendor}</td>
                  <td>{asset.penanggung_jawab}</td>
                  <td>{asset.kondisi_stlh_perbaikan}</td>
                  <td>{asset.status_pemeliharaan}</td>
                  <td>{asset.status}</td>
                  <td>
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => handleDeleteAsset(asset._id)}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => handleEditAsset(asset)}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            <button
              className="text-green-900 border border-green-900 hover:bg-green-100 px-4 py-2 rounded w-28"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="bg-green-900 text-white hover:bg-green-700 px-4 py-2 rounded ml-2 w-28"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </TitleCard>
      <ConfirmDialog
        isOpen={modal.isOpen}
        onClose={closeDialog}
        onConfirm={confirmDelete}
      />

      <div
        className={`modal ${isEditModalOpen ? "modal-open" : ""}`}
        onClick={closeEditModal}
      >
        <div
          className="modal-box relative max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
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
                    value={editFormData.rencana_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                    readOnly
                  >
                    <option value="">{editFormData.rencana_id}</option>
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
                    value={editFormData.kondisi_stlh_perbaikan}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  >
                    <option value="">Pilih jenis kondisi aset</option>
                    <option value="can be used">Perbaikan berhasil</option>
                    <option value="in repair">Dalam Perbaikan</option>
                    <option value="cannot be repaired">Tidak dapat diperbaiki</option>
                  </select>
                </div>
              </div>
            </CardInput>

            <CardInput title="Detail Aset" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="usiaAsetSaatIni" className="block font-medium">
                    Usia Aset Saat Ini *
                  </label>
                  <input
                    type="text"
                    id="usiaAsetSaatIni"
                    name="usiaAsetSaatIni"
                    value={editFormData.usiaAsetSaatIni}
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
                    value={editFormData.maksimalUsiaAset}
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
                    value={editFormData.tahunProduksi}
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
                    value={editFormData.deskripsiKerusakan}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="tanggalPemeliharaanAset" className="block font-medium">
                    Tanggal Rencana Pemeliharaan *
                  </label>
                  <DatePicker
                    selected={editFormData.tanggalPemeliharaanAset}
                    onChange={(date) => handleDateChange(date, "tanggalPemeliharaanAset")}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                    wrapperClassName="date-picker"
                    dateFormat="MMMM d, yyyy"
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="status_pemeliharaan" className="block font-medium">
                    Status Pemeliharaan
                  </label>
                  <select
                    id="status_pemeliharaan"
                    name="status_pemeliharaan"
                    value={editFormData.status_pemeliharaan}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  >
                    <option value="">Pilih status pemeliharaan</option>
                    <option value="Accepted">Direncanakan</option>
                    <option value="In Progress">Dilaksanakan</option>
                    <option value="Completed">Selesai</option>
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
                    value={editFormData.vendorPengelola}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                    readOnly
                  >
                    <option value="">{editFormData.vendorPengelola}</option>
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
                    value={editFormData.infoVendor}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
              </div>
            </CardInput>

            <CardInput title="Informasi Pemeliharaan">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="penanggung_jawab" className="block font-medium">
                    Nama Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    id="penanggung_jawab"
                    name="penanggung_jawab"
                    value={editFormData.penanggung_jawab}
                    onChange={handleInputChange}
                    placeholder="Nama penanggung jawab"
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="deskripsi" className="block font-medium">
                    Deskripsi Pemeliharaan
                  </label>
                  <input
                    type="text"
                    id="deskripsi"
                    name="deskripsi"
                    value={editFormData.deskripsi}
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
                    selected={editFormData.tgl_dilakukan}
                    onChange={(date) => handleDateChange(date, "tgl_dilakukan")}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                    dateFormat="MMMM d, yyyy"
                    wrapperClassName="date-picker"
                  />
                </div>
                <div>
                  <label htmlFor="waktu_pemeliharaan" className="block font-medium">
                    Perkiraan Waktu Pemeliharaan
                  </label>
                  <input
                    type="text"
                    id="waktu_pemeliharaan"
                    name="waktu_pemeliharaan"
                    value={editFormData.waktu_pemeliharaan}
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
        </div>
      </div>
    </>
  );
}

export default PemeliharaanAset;
