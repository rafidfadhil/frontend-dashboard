import React, { useState, useEffect } from "react";
import moment from "moment";
import { useSnackbar } from "notistack";
import TitleCard from "../../components/Cards/TitleCard";
import CardInput from "../../components/Cards/CardInput";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ConfirmDialog from "../../components/Dialog/ConfirmDialog";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../../components/Button";
import BASE_URL_API from "../../config";
import { fetchData, updateData, deleteData } from "../../utils/utils";
import CircularProgress from "@mui/material/CircularProgress"; // Import CircularProgress

const API_URL = `${BASE_URL_API}api/v1/manage-aset/pelihara`;
const RENCANA_URL = `${BASE_URL_API}api/v1/manage-aset/rencana`;
const VENDOR_API_URL = `${BASE_URL_API}api/v1/manage-aset/vendor`;
const ADMIN_API_URL = `${BASE_URL_API}api/v1/manage-aset/admin`;
const ASSET_API_URL = `${BASE_URL_API}api/v1/manage-aset/aset`;
const DARURAT_API_URL = `${BASE_URL_API}api/v1/manage-aset/darurat`;
const ITEMS_PER_PAGE = 10;

const getTagStyle = (status) => {
  return tagStyles[status] || {};
};

const tagStyles = {
  "Dapat digunakan": {
    backgroundColor: "rgba(160 254 208)",
    color: "black",
  },
  "Dalam perbaikan": {
    backgroundColor: "rgba(255 233 158)",
    color: "black",
  },
  "Tidak dapat diperbaiki": {
    backgroundColor: "rgba(255 177 169)",
    color: "black",
  },
  Selesai: { backgroundColor: "rgba(160 254 208)", color: "black" },
  "Sedang berlangsung": {
    backgroundColor: "rgba(255 233 158)",
    color: "black",
  },
  "Perbaikan gagal": {
    backgroundColor: "rgba(255 177 169)",
    color: "black",
  },
};

function PemeliharaanAset() {
  const [assets, setAssets] = useState([]);
  const [rencanaData, setRencanaData] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [assetList, setAssetList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "",
    id: null,
    status: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [originalAssetId, setOriginalAssetId] = useState(null);
  const role = JSON.parse(localStorage.getItem("user"));

  const [editFormData, setEditFormData] = useState({
    asset_id: "",
    rencana_id: "",
    kondisi_stlh_perbaikan: "",
    status_pemeliharaan: "",
    penanggung_jawab: "",
    pengawas: "",
    deskripsi_pemeliharaan: "",
    deskripsi_kerusakan: "",
    tgl_dilakukan: new Date(),
    waktu_pemeliharaan: "",
    usia_aset_saat_ini: "",
    maksimal_usia_aset: "",
    tahun_produksi: "",
    vendor_pengelola: "",
    info_vendor: "",
    nama_aset: "",
    kategori_aset: "",
    merek_aset: "",
    kode_produksi: "",
    jumlah_aset: "",
    aset_masuk: "",
    garansi_dimulai: "",
    garansi_berakhir: "",
    gambar_aset: "",
    status: "",
  });
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  useEffect(() => {
    fetchAssets();
    fetchRencanaData();
    fetchVendorData();
    fetchAdminData();
    fetchAssetList();
  }, [searchQuery, filterStatus]);

  const fetchAssets = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      const token = localStorage.getItem("token");
      const response = await fetchData(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const dataDarurat = response.data_darurat
        ? response.data_darurat.map((item) => ({
            ...item,
            status: "Data Darurat",
          }))
        : [];
      const dataPemeliharaan = response.data_pemeliharaan
        ? response.data_pemeliharaan.map((item) => ({
            ...item,
            status: "Data Pemeliharaan",
          }))
        : [];
      const allAssets = [...dataDarurat, ...dataPemeliharaan];
      allAssets.sort(
        (a, b) => new Date(b.tgl_dilakukan) - new Date(a.tgl_dilakukan)
      );
      allAssets.reverse(); // Ensures latest data is at the top
      const filteredAssets = allAssets.filter(
        (asset) =>
          (filterStatus === "All" || asset.status === filterStatus) &&
          ((asset.rencana_id &&
            asset.rencana_id
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
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
              asset.deskripsi
                .toLowerCase()
                .includes(searchQuery.toLowerCase())))
      );

      setAssets(filteredAssets);
      setTotalPages(Math.ceil(filteredAssets.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Fetching error:", error.message);
      enqueueSnackbar("Gagal memuat data aset.", { variant: "error" });
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  const fetchRencanaData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetchData(RENCANA_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRencanaData(response.data);
    } catch (error) {
      console.error("Fetching rencana error:", error.message);
      enqueueSnackbar("Gagal memuat data rencana.", { variant: "error" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setEditFormData({
        ...editFormData,
        gambar_aset: URL.createObjectURL(file),
      });
    }
  };

  const fetchVendorData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetchData(VENDOR_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVendorList(response.data);
    } catch (error) {
      console.error("Fetching vendor error:", error.message);
      enqueueSnackbar("Gagal memuat data vendor.", { variant: "error" });
    }
  };

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetchData(ADMIN_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdminList(response.data);
    } catch (error) {
      console.error("Fetching admin error:", error.message);
      enqueueSnackbar("Gagal memuat data admin.", { variant: "error" });
    }
  };

  const fetchAssetList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetchData(ASSET_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAssetList(response.data || []); // Ensure data.data exists
    } catch (error) {
      console.error("Fetching asset list error:", error.message);
      enqueueSnackbar("Gagal memuat daftar aset.", { variant: "error" });
    }
  };

  const fetchRencanaById = async (rencana_id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetchData(`${RENCANA_URL}/${rencana_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Fetching rencana error:", error.message);
      enqueueSnackbar("Gagal memuat data rencana.", { variant: "error" });
      throw error;
    }
  };

  const fetchAssetById = async (asset_id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetchData(`${ASSET_API_URL}/${asset_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Fetching asset error:", error.message);
      enqueueSnackbar("Gagal memuat data aset.", { variant: "error" });
      throw error;
    }
  };

  const fetchRegularMaintenanceById = async (id, viewOnly = false) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${API_URL}/${id}`;
      const response = await fetchData(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      const rencanaData = data.rencana_id
        ? await fetchRencanaById(data.rencana_id)
        : null;

      setEditFormData({
        asset_id: data._id,
        rencana_id: data.rencana_id || "",
        kondisi_stlh_perbaikan: data.kondisi_stlh_perbaikan || "",
        status_pemeliharaan: data.status_pemeliharaan || "",
        penanggung_jawab: data.admin._id || "",
        pengawas:
          adminList.find((admin) => admin._id === data.penanggung_jawab)
            ?.nama_lengkap || data.penanggung_jawab,
        deskripsi_pemeliharaan: data.deskripsi || "",
        deskripsi_kerusakan: rencanaData ? rencanaData.deskripsi : "",
        tgl_dilakukan: data.tgl_dilakukan
          ? moment(data.tgl_dilakukan).toDate()
          : new Date(),
        waktu_pemeliharaan: data.waktu_pemeliharaan || "",
        usia_aset_saat_ini: rencanaData ? rencanaData.usia_aset : "",
        maksimal_usia_aset: rencanaData ? rencanaData.maks_usia_aset : "",
        tahun_produksi: rencanaData ? rencanaData.aset.tahun_produksi : "",
        vendor_pengelola: rencanaData ? rencanaData.vendor.nama_vendor : "",
        info_vendor: rencanaData ? rencanaData.vendor.telp_vendor : "",
        nama_aset: rencanaData ? rencanaData.aset.nama_aset : "",
        kategori_aset: rencanaData ? rencanaData.aset.kategori_aset : "",
        merek_aset: rencanaData ? rencanaData.aset.merek_aset : "",
        kode_produksi: rencanaData ? rencanaData.aset.kode_produksi : "",
        jumlah_aset: rencanaData ? rencanaData.aset.jumlah_aset : "",
        aset_masuk: rencanaData
          ? moment(rencanaData.aset.aset_masuk).toDate()
          : new Date(),
        garansi_dimulai: rencanaData
          ? moment(rencanaData.aset.garansi_dimulai).toDate()
          : new Date(),
        garansi_berakhir: rencanaData
          ? moment(rencanaData.aset.garansi_berakhir).toDate()
          : new Date(),
        status: "Data Pemeliharaan",
      });

      if (viewOnly) {
        setIsViewModalOpen(true);
      } else {
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Fetching error:", error.message);
      enqueueSnackbar("Gagal memuat data aset.", { variant: "error" });
    }
  };

  const fetchEmergencyMaintenanceById = async (id, viewOnly = false) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${DARURAT_API_URL}/${id}`;
      const response = await fetchData(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      await fetchAssetList(); // Fetch asset list when fetching emergency maintenance data

      setEditFormData({
        asset_id: data.aset._id,
        rencana_id: "",
        kondisi_stlh_perbaikan: data.kondisi_stlh_perbaikan || "",
        status_pemeliharaan: data.status_pemeliharaan || "",
        penanggung_jawab: data.admin_id || "",
        pengawas: data.penanggung_jawab || "",
        deskripsi_pemeliharaan: data.deskripsi_kerusakan || "",
        deskripsi_kerusakan: data.deskripsi_kerusakan || "",
        tgl_dilakukan: data.tgl_dilakukan
          ? moment(data.tgl_dilakukan).toDate()
          : new Date(),
        waktu_pemeliharaan: data.waktu_pemeliharaan || "",
        usia_aset_saat_ini: "",
        maksimal_usia_aset: "",
        tahun_produksi: data.aset.tahun_produksi || "",
        vendor_pengelola: data.vendor.nama_vendor || "",
        info_vendor: data.vendor.telp_vendor || "",
        nama_aset: data.aset.nama_aset || "",
        kategori_aset: data.aset.kategori_aset || "",
        merek_aset: data.aset.merek_aset || "",
        kode_produksi: data.aset.kode_produksi || "",
        jumlah_aset: data.aset.jumlah_aset || "",
        aset_masuk: data.aset.aset_masuk
          ? moment(data.aset.aset_masuk).toDate()
          : new Date(),
        garansi_dimulai: data.aset.garansi_dimulai
          ? moment(data.aset.garansi_dimulai).toDate()
          : new Date(),
        garansi_berakhir: data.aset.garansi_berakhir
          ? moment(data.aset.garansi_berakhir).toDate()
          : new Date(),
        gambar_aset: data.gambar_darurat?.image_url || "",
        status: "Data Darurat",
      });

      // Store the original asset ID
      setOriginalAssetId(data._id);

      if (viewOnly) {
        setIsViewModalOpen(true);
      } else {
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Fetching error:", error.message);
      enqueueSnackbar("Gagal memuat data aset.", { variant: "error" });
    }
  };

  const handleDeleteAsset = (id, status) => {
    setModal({
      isOpen: true,
      message: "Apakah Anda yakin ingin menghapus aset ini?",
      type: "delete",
      id,
      status,
    });
  };

  const handleEditAsset = (id, status) => {
    if (status === "Data Darurat") {
      fetchEmergencyMaintenanceById(id);
    } else {
      fetchRegularMaintenanceById(id);
    }
  };

  const handleViewAsset = (id, status) => {
    if (status === "Data Darurat") {
      fetchEmergencyMaintenanceById(id, true);
    } else {
      fetchRegularMaintenanceById(id, true);
    }
  };

  const closeDialog = () => {
    setModal({ isOpen: false, id: null, status: "" });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        modal.status === "Data Darurat"
          ? `${DARURAT_API_URL}/${modal.id}`
          : `${API_URL}/${modal.id}`;
      await deleteData(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  const handleRencanaChange = async (e) => {
    const selectedId = e.target.value;
    if (editFormData.status === "Data Darurat") {
      const asset = await fetchAssetById(selectedId);
      setEditFormData((prevState) => ({
        ...prevState,
        asset_id: asset._id,
        deskripsi_kerusakan: asset.deskripsi || prevState.deskripsi_kerusakan,
        tahun_produksi: asset.tahun_produksi || "",
        vendor_pengelola: asset.vendor.nama_vendor || "",
        info_vendor: asset.vendor.telp_vendor || "",
        nama_aset: asset.nama_aset || "",
        kategori_aset: asset.kategori_aset || "",
        merek_aset: asset.merek_aset || "",
        kode_produksi: asset.kode_produksi || "",
        jumlah_aset: asset.jumlah_aset || "",
        aset_masuk: asset.aset_masuk
          ? moment(asset.aset_masuk).toDate()
          : new Date(),
        garansi_dimulai: asset.garansi_dimulai
          ? moment(asset.garansi_dimulai).toDate()
          : new Date(),
        garansi_berakhir: asset.garansi_berakhir
          ? moment(asset.garansi_berakhir).toDate()
          : new Date(),
      }));
    } else {
      const rencana = await fetchRencanaById(selectedId);
      setEditFormData({
        ...editFormData,
        rencana_id: rencana._id,
        deskripsi_kerusakan: rencana.deskripsi || "",
        usia_aset_saat_ini: rencana.usia_aset || "",
        maksimal_usia_aset: rencana.maks_usia_aset || "",
        tahun_produksi: rencana.aset.tahun_produksi || "",
        vendor_pengelola: rencana.vendor.nama_vendor || "",
        info_vendor: rencana.vendor.telp_vendor || "",
        nama_aset: rencana.aset.nama_aset || "",
        kategori_aset: rencana.aset.kategori_aset || "",
        merek_aset: rencana.aset.merek_aset || "",
        kode_produksi: rencana.aset.kode_produksi || "",
        jumlah_aset: rencana.aset.jumlah_aset || "",
        aset_masuk: rencana.aset.aset_masuk
          ? moment(rencana.aset.aset_masuk).toDate()
          : new Date(),
        garansi_dimulai: rencana.aset.garansi_dimulai
          ? moment(rencana.aset.garansi_dimulai).toDate()
          : new Date(),
        garansi_berakhir: rencana.aset.garansi_berakhir
          ? moment(rencana.aset.garansi_berakhir).toDate()
          : new Date(),
      });
    }
  };

  const handleSubmitRegularMaintenance = async (e) => {
    e.preventDefault();
    if (!editFormData.asset_id || !editFormData.penanggung_jawab) {
      enqueueSnackbar("ID aset atau penanggung jawab tidak valid.", {
        variant: "error",
      });
      return;
    }

    const payload = {
      rencana_id: editFormData.rencana_id,
      kondisi_stlh_perbaikan: editFormData.kondisi_stlh_perbaikan,
      status_pemeliharaan: editFormData.status_pemeliharaan,
      penanggung_jawab: editFormData.pengawas,
      deskripsi: editFormData.deskripsi_pemeliharaan,
      tgl_dilakukan: moment(editFormData.tgl_dilakukan).format("YYYY-MM-DD"),
      waktu_pemeliharaan: editFormData.waktu_pemeliharaan,
      admin_id: editFormData.penanggung_jawab,
    };
    console.log("Payload data:", payload);
    try {
      const token = localStorage.getItem("token");
      const response = await updateData(
        `${API_URL}/${editFormData.asset_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response data:", response);
      fetchAssets();
      enqueueSnackbar("Data berhasil diperbarui!", { variant: "success" });
      closeEditModal();
    } catch (error) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        enqueueSnackbar(
          `Gagal memperbarui data! ${error.response.data.message}`,
          { variant: "error" }
        );
      } else {
        console.error("Error posting data:", error.message);
        enqueueSnackbar("Gagal memperbarui data!", { variant: "error" });
      }
    }
  };

  const handleSubmitEmergencyMaintenance = async (e) => {
    e.preventDefault();
    if (!editFormData.asset_id || !editFormData.penanggung_jawab) {
      enqueueSnackbar("ID aset atau penanggung jawab tidak valid.", {
        variant: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("AsetID", editFormData.asset_id); // Gunakan ID asli
    formData.append("vendor_id", editFormData.vendor_pengelola);
    formData.append(
      "KondisiStlhPerbaikan",
      editFormData.kondisi_stlh_perbaikan
    );
    formData.append("StatusPemeliharaan", editFormData.status_pemeliharaan);
    formData.append("PenanggungJawab", editFormData.pengawas);
    formData.append("Deskripsi", editFormData.deskripsi_pemeliharaan);
    if (imageFile) {
      formData.append("gambar", imageFile);
    }
    formData.append(
      "TanggalDilakukan",
      moment(editFormData.tgl_dilakukan).format("YYYY-MM-DD")
    );
    formData.append("WaktuPemeliharaan", editFormData.waktu_pemeliharaan);
    formData.append("admin_id", editFormData.penanggung_jawab);

    try {
      const token = localStorage.getItem("token");
      const response = await updateData(
        `${DARURAT_API_URL}/${originalAssetId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response data:", response);
      fetchAssets();
      enqueueSnackbar("Data berhasil diperbarui!", { variant: "success" });
      closeEditModal();
    } catch (error) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        enqueueSnackbar(
          `Gagal memperbarui data! ${error.response.data.message}`,
          {
            variant: "error",
          }
        );
      } else {
        console.error("Error posting data:", error.message);
        enqueueSnackbar("Gagal memperbarui data!", { variant: "error" });
      }
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
        {isLoading ? ( // Display loading spinner when data is being fetched
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Nama Aset</th>
                  <th>Tanggal Pemeliharaan</th>
                  <th>Vendor Pengelola</th>
                  <th>Penanggung Jawab</th>
                  <th>Kondisi Setelah Perbaikan</th>
                  <th>Status Perbaikan</th>
                  <th>Data Perbaikan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <tr key={asset._id} className="whitespace-nowrap">
                    <td className="overflow-hidden overflow-ellipsis">
                      {asset.aset.nama_aset}
                    </td>
                    <td className="overflow-hidden overflow-ellipsis">
                      {moment(asset.tgl_dilakukan).format("DD MMM YYYY")}
                    </td>
                    <td className="overflow-hidden overflow-ellipsis">
                      {asset.vendor.nama_vendor}
                    </td>
                    <td className="overflow-hidden overflow-ellipsis">
                      {adminList.find(
                        (admin) => admin._id === asset.penanggung_jawab
                      )?.nama_lengkap || asset.penanggung_jawab}
                    </td>
                    <td className="overflow-hidden overflow-ellipsis">
                      <span
                        style={{
                          ...getTagStyle(asset.kondisi_stlh_perbaikan),
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {asset.kondisi_stlh_perbaikan}
                      </span>
                    </td>
                    <td className="overflow-hidden overflow-ellipsis">
                      <span
                        style={{
                          ...getTagStyle(asset.status_pemeliharaan),
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {asset.status_pemeliharaan}
                      </span>
                    </td>
                    <td className="overflow-hidden overflow-ellipsis">
                      {asset.status}
                    </td>
                    <td className="overflow-hidden overflow-ellipsis flex">
                      {role.role !== "admin aset" && (
                        <button
                          className="btn btn-square btn-ghost text-red-500"
                          onClick={() =>
                            handleDeleteAsset(asset._id, asset.status)
                          }
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        className="btn btn-square btn-ghost text-yellow-500"
                        onClick={() => handleEditAsset(asset._id, asset.status)}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="btn btn-square btn-ghost text-black"
                        onClick={() => handleViewAsset(asset._id, asset.status)}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              className="bg-[#3A5913] text-white hover:bg-[#293F0D] px-4 py-2 rounded ml-2 w-28"
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
          <form
            onSubmit={
              editFormData.status === "Data Darurat"
                ? handleSubmitEmergencyMaintenance
                : handleSubmitRegularMaintenance
            }
          >
            <CardInput title="Identitas Aset">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rencana_id" className="block font-medium">
                    Nama Aset *
                  </label>
                  <select
                    id="rencana_id"
                    name="rencana_id"
                    value={
                      editFormData.status === "Data Darurat"
                        ? editFormData.asset_id
                        : editFormData.rencana_id
                    }
                    onChange={handleRencanaChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  >
                    <option value="">Pilih Nama Aset</option>
                    {editFormData.status === "Data Darurat"
                      ? assetList.map((asset) => (
                          <option key={asset._id} value={asset._id}>
                            {asset.nama_aset}
                          </option>
                        ))
                      : rencanaData.map((rencana) => (
                          <option key={rencana._id} value={rencana._id}>
                            {rencana.aset.nama_aset}
                          </option>
                        ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="kondisi_stlh_perbaikan"
                    className="block font-medium"
                  >
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
                    <option value="Dapat digunakan">Dapat digunakan</option>
                    <option value="Dalam perbaikan">Dalam Perbaikan</option>
                    <option value="Tidak dapat diperbaiki">
                      Tidak dapat diperbaiki
                    </option>
                  </select>
                </div>
              </div>
            </CardInput>

            <CardInput title="Detail Aset" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editFormData.status === "Data Pemeliharaan" && (
                  <>
                    <div>
                      <label
                        htmlFor="usia_aset_saat_ini"
                        className="block font-medium"
                      >
                        Usia Aset Saat Ini *
                      </label>
                      <input
                        type="number"
                        id="usia_aset_saat_ini"
                        name="usia_aset_saat_ini"
                        value={editFormData.usia_aset_saat_ini}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="maksimal_usia_aset"
                        className="block font-medium"
                      >
                        Maksimal Usia Aset *
                      </label>
                      <input
                        type="number"
                        id="maksimal_usia_aset"
                        name="maksimal_usia_aset"
                        value={editFormData.maksimal_usia_aset}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label htmlFor="tahun_produksi" className="block font-medium">
                    Tahun Produksi
                  </label>
                  <input
                    type="number"
                    id="tahun_produksi"
                    name="tahun_produksi"
                    value={editFormData.tahun_produksi}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deskripsi_kerusakan"
                    className="block font-medium"
                  >
                    Deskripsi Kerusakan
                  </label>
                  <input
                    type="text"
                    id="deskripsi_kerusakan"
                    name="deskripsi_kerusakan"
                    value={editFormData.deskripsi_kerusakan}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="tgl_dilakukan" className="block font-medium">
                    Tanggal Pemeliharaan *
                  </label>
                  <DatePicker
                    selected={editFormData.tgl_dilakukan}
                    onChange={(date) => handleDateChange(date, "tgl_dilakukan")}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                    wrapperClassName="date-picker"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
                <div>
                  <label
                    htmlFor="status_pemeliharaan"
                    className="block font-medium"
                  >
                    Status Pemeliharaan *
                  </label>
                  <select
                    id="status_pemeliharaan"
                    name="status_pemeliharaan"
                    value={editFormData.status_pemeliharaan}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  >
                    <option value="">Pilih status pemeliharaan</option>
                    <option value="Selesai">Perbaikan berhasil</option>
                    <option value="Sedang berlangsung">
                      Sedang berlangsung
                    </option>
                    <option value="Perbaikan gagal">Perbaikan gagal</option>
                  </select>
                </div>
              </div>
            </CardInput>

            <CardInput title="Informasi Vendor Pengelola" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="vendor_pengelola"
                    className="block font-medium"
                  >
                    Vendor Pengelola *
                  </label>
                  <input
                    type="text"
                    id="vendor_pengelola"
                    name="vendor_pengelola"
                    value={editFormData.vendor_pengelola}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="info_vendor" className="block font-medium">
                    Informasi vendor / no telpon
                  </label>
                  <input
                    type="text"
                    id="info_vendor"
                    name="info_vendor"
                    value={editFormData.info_vendor}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
              </div>
            </CardInput>

            <CardInput title="Informasi Pemeliharaan" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="penanggung_jawab"
                    className="block font-medium"
                  >
                    Nama Penanggung Jawab *
                  </label>
                  <select
                    id="penanggung_jawab"
                    name="penanggung_jawab"
                    value={editFormData.penanggung_jawab}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  >
                    <option value="">Pilih penanggung jawab</option>
                    {adminList.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="pengawas" className="block font-medium">
                    Pengawas
                  </label>
                  <input
                    type="text"
                    id="pengawas"
                    name="pengawas"
                    value={editFormData.pengawas}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
                {editFormData.status !== "Data Darurat" && (
                  <div>
                    <label
                      htmlFor="deskripsi_pemeliharaan"
                      className="block font-medium"
                    >
                      Deskripsi Pemeliharaan
                    </label>
                    <input
                      type="text"
                      id="deskripsi_pemeliharaan"
                      name="deskripsi_pemeliharaan"
                      value={editFormData.deskripsi_pemeliharaan}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                    />
                  </div>
                )}
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
                  <label
                    htmlFor="waktu_pemeliharaan"
                    className="block font-medium"
                  >
                    Perkiraan Waktu Pemeliharaan
                  </label>
                  <input
                    type="text"
                    id="waktu_pemeliharaan"
                    name="waktu_pemeliharaan"
                    value={editFormData.waktu_pemeliharaan}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  />
                </div>
              </div>
            </CardInput>

            {editFormData.status === "Data Darurat" && (
              <CardInput title="Dokumen Kerusakan" className="mt-4">
                <div className="flex flex-col items-center">
                  <div className="mb-2">
                    <img
                      src={editFormData.gambar_aset || "/default-image.png"}
                      alt="Asset"
                      className="w-24 h-24 object-cover cursor-pointer"
                      onClick={() => {
                        setSelectedImage(editFormData.gambar_aset);
                        setIsImageModalOpen(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="cursor-pointer text-green-500 hover:text-green-600 border border-green-500 font-medium py-2 px-6 rounded bg-white flex-grow sm:flex-grow-0"
                    >
                      Choose File
                    </label>
                    <span className="ml-2">
                      {imageFile ? "File Selected" : "No File Chosen"}
                    </span>
                  </div>
                </div>
              </CardInput>
            )}

            <div className="flex justify-end mt-4">
              <Button label="Simpan" type="submit" />
            </div>
          </form>
        </div>
      </div>

      <div
        className={`modal ${isViewModalOpen ? "modal-open" : ""}`}
        onClick={closeViewModal}
      >
        <div
          className="modal-box relative max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardInput title="Identitas Aset">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="view_rencana_id" className="block font-medium">
                  Nama Aset
                </label>
                <input
                  type="text"
                  id="view_rencana_id"
                  name="view_rencana_id"
                  value={editFormData.nama_aset}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label
                  htmlFor="view_kondisi_stlh_perbaikan"
                  className="block font-medium"
                >
                  Kondisi Setelah Perbaikan
                </label>
                <input
                  type="text"
                  id="view_kondisi_stlh_perbaikan"
                  name="view_kondisi_stlh_perbaikan"
                  value={editFormData.kondisi_stlh_perbaikan}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
            </div>
          </CardInput>

          <CardInput title="Detail Aset" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editFormData.status === "Data Pemeliharaan" && (
                <>
                  <div>
                    <label
                      htmlFor="view_usia_aset_saat_ini"
                      className="block font-medium"
                    >
                      Usia Aset Saat Ini
                    </label>
                    <input
                      type="number"
                      id="view_usia_aset_saat_ini"
                      name="view_usia_aset_saat_ini"
                      value={editFormData.usia_aset_saat_ini}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                      disabled
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="view_maksimal_usia_aset"
                      className="block font-medium"
                    >
                      Maksimal Usia Aset
                    </label>
                    <input
                      type="number"
                      id="view_maksimal_usia_aset"
                      name="view_maksimal_usia_aset"
                      value={editFormData.maksimal_usia_aset}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                      disabled
                    />
                  </div>
                </>
              )}
              <div>
                <label
                  htmlFor="view_tahun_produksi"
                  className="block font-medium"
                >
                  Tahun Produksi
                </label>
                <input
                  type="number"
                  id="view_tahun_produksi"
                  name="view_tahun_produksi"
                  value={editFormData.tahun_produksi}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label
                  htmlFor="view_deskripsi_kerusakan"
                  className="block font-medium"
                >
                  Deskripsi Kerusakan
                </label>
                <input
                  type="text"
                  id="view_deskripsi_kerusakan"
                  name="view_deskripsi_kerusakan"
                  value={editFormData.deskripsi_kerusakan}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label
                  htmlFor="view_tgl_dilakukan"
                  className="block font-medium"
                >
                  Tanggal Pemeliharaan
                </label>
                <input
                  type="text"
                  id="view_tgl_dilakukan"
                  name="view_tgl_dilakukan"
                  value={moment(editFormData.tgl_dilakukan).format(
                    "MMMM d, yyyy"
                  )}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label
                  htmlFor="view_status_pemeliharaan"
                  className="block font-medium"
                >
                  Status Pemeliharaan
                </label>
                <input
                  type="text"
                  id="view_status_pemeliharaan"
                  name="view_status_pemeliharaan"
                  value={editFormData.status_pemeliharaan}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
            </div>
          </CardInput>

          <CardInput title="Informasi Vendor Pengelola" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="view_vendor_pengelola"
                  className="block font-medium"
                >
                  Vendor Pengelola
                </label>
                <input
                  type="text"
                  id="view_vendor_pengelola"
                  name="view_vendor_pengelola"
                  value={editFormData.vendor_pengelola}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label htmlFor="view_info_vendor" className="block font-medium">
                  Informasi vendor / no telpon
                </label>
                <input
                  type="text"
                  id="view_info_vendor"
                  name="view_info_vendor"
                  value={editFormData.info_vendor}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
            </div>
          </CardInput>

          <CardInput title="Informasi Pemeliharaan" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="view_penanggung_jawab"
                  className="block font-medium"
                >
                  Nama Penanggung Jawab
                </label>
                <input
                  type="text"
                  id="view_penanggung_jawab"
                  name="view_penanggung_jawab"
                  value={
                    adminList.find(
                      (admin) => admin._id === editFormData.penanggung_jawab
                    )?.nama_lengkap || editFormData.penanggung_jawab
                  }
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label htmlFor="view_pengawas" className="block font-medium">
                  Pengawas
                </label>
                <input
                  type="text"
                  id="view_pengawas"
                  name="view_pengawas"
                  value={editFormData.pengawas}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
              {editFormData.status !== "Data Darurat" && (
                <div>
                  <label
                    htmlFor="view_deskripsi_pemeliharaan"
                    className="block font-medium"
                  >
                    Deskripsi Pemeliharaan
                  </label>
                  <input
                    type="text"
                    id="view_deskripsi_pemeliharaan"
                    name="view_deskripsi_pemeliharaan"
                    value={editFormData.deskripsi_pemeliharaan}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                    disabled
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor="view_tgl_dilakukan"
                  className="block font-medium"
                >
                  Tanggal Pemeliharaan Dilakukan
                </label>
                <input
                  type="text"
                  id="view_tgl_dilakukan"
                  name="view_tgl_dilakukan"
                  value={moment(editFormData.tgl_dilakukan).format(
                    "MMMM d, yyyy"
                  )}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label
                  htmlFor="view_waktu_pemeliharaan"
                  className="block font-medium"
                >
                  Perkiraan Waktu Pemeliharaan
                </label>
                <input
                  type="text"
                  id="view_waktu_pemeliharaan"
                  name="view_waktu_pemeliharaan"
                  value={editFormData.waktu_pemeliharaan}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                  disabled
                />
              </div>
            </div>
          </CardInput>

          {editFormData.status === "Data Darurat" && (
            <CardInput title="Dokumen Kerusakan" className="mt-4">
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <img
                    src={editFormData.gambar_aset || "/default-image.png"}
                    alt="Asset"
                    className="w-48 h-48 object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedImage(editFormData.gambar_aset);
                      setIsImageModalOpen(true);
                    }}
                  />
                </div>
              </div>
            </CardInput>
          )}

          <div className="flex justify-end mt-4">
            <Button label="Tutup" onClick={closeViewModal} />
          </div>
        </div>
      </div>

      <div
        className={`modal ${isImageModalOpen ? "modal-open" : ""}`}
        onClick={closeImageModal}
      >
        <div
          className="modal-box relative max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center items-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Selected Asset"
                className="max-w-full max-h-screen"
              />
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button label="Tutup" onClick={closeImageModal} />
          </div>
        </div>
      </div>
    </>
  );
}

export default PemeliharaanAset;
