/**
 * Web Bluetooth ESC/POS Thermal Printer Helper for 58mm printers
 * Kompatibel dengan printer Bluetooth murah (Panda, VSC, EPPOS, GOOJPRT, MiniPOS)
 */

let bluetoothDevice = null;
let printCharacteristic = null;

// UUID umum untuk printer thermal Bluetooth 58mm/80mm
const PRINTER_SERVICES = [
    '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS service
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // ISSC
    '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Microchip
    '0000ff00-0000-1000-8000-00805f9b34fb', // Common Chinese mini printers
];

export const isWebBluetoothSupported = () => {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
};

export const isPrinterConnected = () => {
    return Boolean(
        bluetoothDevice &&
        bluetoothDevice.gatt &&
        bluetoothDevice.gatt.connected &&
        printCharacteristic
    );
};

export const getConnectedPrinterName = () => {
    return isPrinterConnected()
        ? bluetoothDevice.name || 'Printer Bluetooth 58mm'
        : null;
};

export const connectPrinter = async () => {
    if (!isWebBluetoothSupported()) {
        throw new Error('Web Bluetooth tidak didukung pada browser ini. Gunakan Google Chrome di Android/PC.');
    }

    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: PRINTER_SERVICES,
        });

        // Tangani jika printer terputus/dimatikan tiba-tiba
        bluetoothDevice.addEventListener('gattserverdisconnected', () => {
            printCharacteristic = null;
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('printer-status-changed', {
                    detail: { connected: false, name: null }
                }));
            }
        });

        const server = await bluetoothDevice.gatt.connect();

        // Cari service yang cocok
        let service = null;
        for (const uuid of PRINTER_SERVICES) {
            try {
                service = await server.getPrimaryService(uuid);
                if (service) break;
            } catch (e) {
                // coba service berikutnya
            }
        }

        if (!service) {
            // Jika service spesifik tidak terdeteksi, coba ambil service pertama
            const services = await server.getPrimaryServices();
            if (services.length > 0) {
                service = services[0];
            } else {
                throw new Error('Service printer Bluetooth tidak ditemukan.');
            }
        }

        // Cari characteristic yang dapat menerima data write
        const characteristics = await service.getCharacteristics();
        printCharacteristic = characteristics.find(c => c.properties.write || c.properties.writeWithoutResponse);

        if (!printCharacteristic) {
            throw new Error('Karakteristik cetak tidak ditemukan pada printer.');
        }

        const printerInfo = {
            connected: true,
            name: bluetoothDevice.name || 'Printer Bluetooth 58mm',
        };

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('printer-status-changed', {
                detail: printerInfo
            }));
        }

        return printerInfo;
    } catch (err) {
        console.error('Bluetooth connection error:', err);
        throw err;
    }
};

export const disconnectPrinter = () => {
    if (bluetoothDevice && bluetoothDevice.gatt && bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
    }
    bluetoothDevice = null;
    printCharacteristic = null;
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('printer-status-changed', {
            detail: { connected: false, name: null }
        }));
    }
};

/**
 * Panggil cetak browser secara eksplisit dan aman
 */
export const triggerBrowserPrint = () => {
    if (typeof window !== 'undefined') {
        window.print();
    }
};

/**
 * Format string teks menjadi baris 32 karakter untuk printer 58mm
 */
const formatTwoColumn = (left, right, maxLen = 32) => {
    const spaceCount = Math.max(1, maxLen - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right;
};

/**
 * Cetak data transaksi pesanan ke printer thermal 58mm via ESC/POS byte array.
 * Default: TIDAK memicu window.print() otomatis jika printer belum terhubung agar browser tidak freeze/stuck.
 */
export const printReceiptESC = async (order, options = { fallbackToBrowser: false, store: null }) => {
    if (!isPrinterConnected()) {
        if (options?.fallbackToBrowser) {
            triggerBrowserPrint();
            return { success: true, method: 'browser' };
        }
        return {
            success: false,
            reason: 'NO_PRINTER',
            message: 'Mesin printer thermal tidak terdeteksi atau belum terhubung.'
        };
    }

    try {
        const encoder = new TextEncoder();
        const ESC = '\x1B';
        const GS = '\x1D';

        const storeName = options?.store?.name ? options.store.name.toUpperCase() : 'PECEL LELE SEDAP';
        const storeAddress = options?.store?.address || 'Jl. Raya Warung Malam No. 12';
        const storePhone = options?.store?.phone ? `Telp / WA: ${options.store.phone}` : 'Telp / WA: 0812-3456-7890';
        const storeFooter = options?.store?.receipt_footer || 'Matur Nuwun / Terima Kasih\nSelamat Menikmati!';

        let commands = '';

        // Reset & Initialize
        commands += ESC + '@';

        // Header: Center Align
        commands += ESC + 'a\x01';
        commands += ESC + 'E\x01'; // Bold ON
        commands += `${storeName}\n`;
        commands += ESC + 'E\x00'; // Bold OFF
        commands += `${storeAddress}\n`;
        commands += `${storePhone}\n`;
        commands += '================================\n';

        // Order Info: Left Align
        commands += ESC + 'a\x00';
        commands += `No: ${order.order_number}\n`;
        commands += `Waktu: ${new Date(order.created_at || Date.now()).toLocaleString('id-ID')}\n`;
        commands += `Kasir: ${order.cashier_name || 'Kasir'} | ${order.order_type === 'dine_in' ? 'Makan di Tempat' : 'Bungkus'}\n`;
        if (order.table_number) {
            commands += `Meja : ${order.table_number}\n`;
        }
        if (order.customer_name) {
            commands += `Nama : ${order.customer_name}\n`;
        }
        commands += '--------------------------------\n';

        // Items List
        (order.items || []).forEach(item => {
            const qtyStr = `${item.quantity}x ${item.product_name || item.name}`;
            const subtotalStr = `Rp ${(item.subtotal || (item.unit_price * item.quantity)).toLocaleString('id-ID')}`;
            commands += formatTwoColumn(qtyStr.substring(0, 20), subtotalStr) + '\n';
            if (item.notes) {
                commands += `  * ${item.notes}\n`;
            }
        });

        commands += '--------------------------------\n';

        // Total & Payment
        commands += ESC + 'E\x01';
        commands += formatTwoColumn('TOTAL', `Rp ${order.total_amount.toLocaleString('id-ID')}`) + '\n';
        commands += ESC + 'E\x00';

        if (order.payment_method === 'cash') {
            commands += formatTwoColumn('TUNAI', `Rp ${(order.cash_received || order.total_amount).toLocaleString('id-ID')}`) + '\n';
            commands += formatTwoColumn('KEMBALI', `Rp ${(order.change_returned || 0).toLocaleString('id-ID')}`) + '\n';
        } else {
            commands += formatTwoColumn('PEMBAYARAN', 'QRIS (LUNAS)') + '\n';
        }

        // Footer: Center
        commands += '================================\n';
        commands += ESC + 'a\x01';
        commands += `${storeFooter}\n\n\n\n`;

        // Feed & Cut
        commands += GS + 'V\x41\x03';

        // Kirim bytes dalam potongan kecil (chunk 512 byte) agar aman untuk buffer printer murah
        const data = encoder.encode(commands);
        const chunkSize = 512;
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await printCharacteristic.writeValue(chunk);
        }

        return { success: true, method: 'bluetooth' };
    } catch (err) {
        console.error('Error printing ESC/POS:', err);
        if (options?.fallbackToBrowser) {
            triggerBrowserPrint();
            return { success: true, method: 'browser_fallback' };
        }
        return { success: false, reason: 'PRINT_ERROR', error: err.message };
    }
};
