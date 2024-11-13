import * as ExcelJS from "exceljs";

export const downloadExcelWithImages = async (
  data: any[],
  chunkSize: number = 10
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Tracks");

  sheet.columns = [
    { header: "Album Image", key: "album_image", width: 30 },
    { header: "Name", key: "name", width: 30 },
    { header: "Artist", key: "artist", width: 30 },
    { header: "Album", key: "album", width: 30 },
    { header: "Released At", key: "released_at", width: 20 },
    { header: "Added At", key: "added_at", width: 20 },
  ];
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0000FF" },
  };
  const processChunk = async (startIndex: number) => {
    for (
      let i = startIndex;
      i < Math.min(startIndex + chunkSize, data.length);
      i++
    ) {
      const track = data[i];
      const row = sheet.addRow({
        name: track.name,
        artist: track.artist,
        album: track.album,
        added_at: track.added_at,
        released_at: track.released_at,
      });

      const imageUrl = track.album_image;
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.blob();

      const imageId = workbook.addImage({
        base64: await blobToBase64(imageBuffer),
        extension: "jpeg",
      });
      sheet.addImage(imageId, {
        tl: { col: 0, row: row.number - 1 },
        ext: { width: 130, height: 130 }, // Adjust the width and height as needed
      });
      row.height = 100;

      row.getCell(1).font = { italic: true, color: { argb: "FF00FF00" } };
      row.getCell(2).alignment = { horizontal: "right" };
      row.getCell(3).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
    if (startIndex + chunkSize < data.length) {
      setTimeout(() => processChunk(startIndex + chunkSize), 0);
    } else {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tracks.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  processChunk(0);
};
export const downloadExcelWithImagesAndFormatting = async (
  data: any[],
  chunkSize: number = 10
) => {
  const { workbook, sheet } = createWorkbook();
  processChunk(data, 0, chunkSize, sheet, workbook);
};

export const createWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Tracks");

  sheet.columns = [
    { header: "Name", key: "name", width: 30 },
    { header: "Artist", key: "artist", width: 30 },
    { header: "Album", key: "album", width: 30 },
    { header: "Added At", key: "added_at", width: 20 },
    { header: "Album Image", key: "album_image", width: 30 },
  ];

  // Format header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0000FF" },
  };

  return { workbook, sheet };
};

const processChunk = async (
  data: any[],
  startIndex: number,
  chunkSize: number,
  sheet: ExcelJS.Worksheet,
  workbook: ExcelJS.Workbook
) => {
  for (
    let i = startIndex;
    i < Math.min(startIndex + chunkSize, data.length);
    i++
  ) {
    await addRowWithImage(sheet, workbook, data[i]);
  }

  if (startIndex + chunkSize < data.length) {
    setTimeout(
      () =>
        processChunk(data, startIndex + chunkSize, chunkSize, sheet, workbook),
      0
    );
  } else {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tracks.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

const addRowWithImage = async (
  sheet: ExcelJS.Worksheet,
  workbook: ExcelJS.Workbook,
  track: any
) => {
  const row = sheet.addRow({
    name: track.name,
    artist: track.artist,
    album: track.album,
    added_at: track.added_at,
    released_at: track.released_at,
  });

  const imageUrl = track.album_image;
  if (imageUrl) {
    const imageBuffer = await fetchImage(imageUrl);

    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "jpeg",
    });

    sheet.addImage(imageId, {
      tl: { col: 4, row: row.number - 1 },
      ext: { width: 100, height: 100 }, // Adjust the width and height as needed
    });

    // Adjust the row height to fit the image
    row.height = 80; // Adjust the height as needed
  }

  // Format cells in the current row
  row.getCell(1).font = { italic: true, color: { argb: "FF00FF00" } };
  row.getCell(2).alignment = { horizontal: "right" };
  row.getCell(3).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
};

const imageCache: { [url: string]: Buffer } = {};

const fetchImage = async (url: string): Promise<Buffer> => {
  if (imageCache[url]) {
    return imageCache[url];
  }

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(buffer);
  imageCache[url] = imageBuffer;
  return imageBuffer;
};
