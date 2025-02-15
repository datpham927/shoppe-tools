import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./ProductFilter.css";

export default function ProductFilter() {
  // -----------------------------
  // State cho phần JSON
  // -----------------------------
  const [data, setData] = useState("");
  const [filteredList, setFilteredList] = useState([]);

  // -----------------------------
  // State cho phần Excel
  // -----------------------------
  const [excelData, setExcelData] = useState([]); // mảng mảng
  const [excelLinks, setExcelLinks] = useState([]); // danh sách link

  // -----------------------------
  // Lấy danh sách cũ từ localStorage khi mount
  // -----------------------------
  useEffect(() => {
    const storedData = localStorage.getItem("filtered_products");
    if (storedData) {
      const oldProducts = storedData.split("\n").map((url) => ({
        name: "Sản phẩm trước",
        url,
      }));
      setFilteredList(oldProducts);
    }
  }, []);

  // ============================================================
  // =============== PHẦN XỬ LÝ JSON (CỘT TRÁI) ===============
  // ============================================================
  // 1) Lọc dữ liệu JSON
  const handleFilter = () => {
    try {
      const productList = JSON.parse(data)?.data?.list || [];

      const newProducts = productList
        .filter((e) => e.productClicks > 2)
        .map((e) => ({
          name: e.title,
          url: `https://affiliate.shopee.vn/offer/product_offer/${e.itemId}`,
        }));

      // Lấy cũ từ localStorage
      const storedData = localStorage.getItem("filtered_products");
      const oldProducts = storedData ? storedData.split("\n") : [];

      // Gộp, bỏ trùng
      const updatedProducts = Array.from(
        new Set([...oldProducts, ...newProducts.map((p) => p.url)])
      );

      localStorage.setItem("filtered_products", updatedProducts.join("\n"));
      setFilteredList(
        updatedProducts.map((url) => ({ name: "Sản phẩm đã lọc", url }))
      );
    } catch (error) {
      console.error("Lỗi JSON:", error);
    }
  };

  // 2) Tải TXT
  const handleDownload = () => {
    const storedData = localStorage.getItem("filtered_products");
    const oldProducts = storedData ? storedData.split("\n") : [];

    const newProducts = filteredList.map((e) => e.url);
    const updatedProducts = Array.from(new Set([...oldProducts, ...newProducts]));

    localStorage.setItem("filtered_products", updatedProducts.join("\n"));

    const blob = new Blob([updatedProducts.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_products.txt";
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // ============================================================
  // ============ PHẦN UPLOAD EXCEL (CỘT PHẢI) ================
  // ============================================================
  // 1) Đọc file Excel
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setExcelData(data);
    };
    reader.readAsBinaryString(file);
  };

  // 2) Tạo link
  const handleGenerateLinks = () => {
    if (excelData.length === 0) return;
    // Giả sử row[1] là itemId, row đầu là header => slice(1)
    const newLinks = excelData.slice(1).map((row) => {
      const itemId = row[8]; // cột B
      return  itemId;
    });
    setExcelLinks(newLinks);
  };

  // 3) Tải TXT (Excel)
  const handleDownloadTxt = () => {
    if (excelLinks.length === 0) return;
    const blob = new Blob([excelLinks.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "excel_links.txt";
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // ============================================================
  // =============== GIAO DIỆN 2 CỘT (CSS THƯỜNG) ===============
  // ============================================================
  return (
    <div className="main-container">
      <h1 className="heading">Công cụ lọc sản phẩm & Excel</h1>
      <div className="row">
        {/* CỘT TRÁI: JSON */}
        <div className="col card">
          <h2 className="title">Bộ lọc (JSON)</h2>
          <label className="label">Dữ liệu JSON:</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder="Dán dữ liệu JSON..."
            value={data}
            onChange={(e) => setData(e.target.value)}
          ></textarea>

          <div className="button-group">
            <button onClick={handleFilter} className="btn btn-blue">
              Lọc dữ liệu
            </button>
            <button onClick={handleDownload} className="btn btn-green">
              Tải TXT
            </button>
          </div>

          {filteredList.length > 0 && (
            <div className="result-block">
              <h3 className="subtitle">Kết quả: {filteredList.length}</h3>
              <ul className="list">
                {filteredList.map((item, idx) => (
                  <li key={idx} className="list-item">
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: EXCEL */}
        <div className="col card">
          <h2 className="title">Upload Excel</h2>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            className="file-input"
          />

          {excelData.length > 0 && (
            <div className="info-block">
              <p>Đã đọc {excelData.length} dòng (kể cả header).</p>
              <button onClick={handleGenerateLinks} className="btn btn-blue">
                Tạo link
              </button>
            </div>
          )}

          {excelLinks.length > 0 && (
            <div className="result-block">
              <p>
                Đã tạo <strong>{excelLinks.length}</strong> link:
              </p>
              <button onClick={handleDownloadTxt} className="btn btn-green">
                Tải TXT
              </button>
              <ul className="list">
                {excelLinks.map((link, idx) => (
                  <li key={idx} className="list-item">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
