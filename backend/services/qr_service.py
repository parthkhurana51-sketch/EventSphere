import qrcode
from pathlib import Path


QR_FOLDER = Path("generated_qr")
QR_FOLDER.mkdir(exist_ok=True)


def generate_qr_code(qr_token: str):

    file_path = QR_FOLDER / f"{qr_token}.png"

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4
    )

    qr.add_data(qr_token)
    qr.make(fit=True)

    image = qr.make_image()
    image.save(file_path)

    return str(file_path)