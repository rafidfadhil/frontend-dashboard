import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import TambahAset from "../../../features/Aset/tambahAset";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Kelola Aset" }));
  }, []);

  return <TambahAset />;
}

export default InternalPage;
