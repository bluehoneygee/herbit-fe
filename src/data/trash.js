const trashData = [
  // 🌱 Organik
  {
    id: "kulit_pisang",
    name: "Kulit Pisang",
    image: "/trash/kulit-pisang.png",
    category: "green",
    reason:
      "Kulit pisang termasuk sampah organik karena mudah terurai dan bisa dijadikan kompos. Masukkan ke bin Hijau.",
  },
  {
    id: "hot_dog",
    name: "Sisa Hotdog",
    image: "/trash/hot-dog.png",
    category: "green",
    reason: "Sisa makanan, mudah terurai, masukkan ke bin Hijau.",
  },
  {
    id: "roti",
    name: "Roti Sisa",
    image: "/trash/roti.png",
    category: "green",
    reason: "Roti termasuk sampah organik yang dapat terurai dengan cepat.",
  },
  {
    id: "apple",
    name: "Apel",
    image: "/trash/apple.png",
    category: "green",
    reason: "Sisa buah dapat dijadikan kompos, masukkan ke bin Hijau.",
  },
  {
    id: "broccoli",
    name: "Brokoli",
    image: "/trash/broccoli.png",
    category: "green",
    reason: "Sisa sayuran yang bisa terurai alami, masukkan ke bin Hijau.",
  },
  {
    id: "autumn",
    name: "Daun Kering",
    image: "/trash/autumn.png",
    category: "green",
    reason: "Daun kering dapat dikomposkan, buang ke bin Hijau.",
  },
  {
    id: "donut",
    name: "Donat",
    image: "/trash/donut.png",
    category: "green",
    reason: "Makanan yang bisa terurai alami, masukkan ke bin Hijau.",
  },
  {
    id: "tisu",
    name: "Tisu Toilet",
    image: "/trash/toilet.png",
    category: "green",
    reason:
      "Kalau tisu toilet bekas basah atau kotor, harus masuk ke residu / organik → biasanya bin hijau atau bin residu.",
  },

  // ♻️ Daur Ulang (Kuning / Biru)
  {
    id: "botol_plastik",
    name: "Botol Plastik",
    image: "/trash/plastic-glass.png",
    category: "yellow",
    reason:
      "Botol plastik masuk kategori daur ulang (bin Kuning) karena dapat diproses kembali. Sebaiknya bilas dulu dan lepas tutupnya bila berbeda material.",
  },
  {
    id: "plastic_cup",
    name: "Gelas Plastik",
    image: "/trash/plastic-cup.png",
    category: "yellow",
    reason:
      "Gelas plastik dapat didaur ulang. Bilas terlebih dahulu agar bersih sebelum dimasukkan ke bin Kuning.",
  },
  {
    id: "spray_bottle",
    name: "Botol Semprot",
    image: "/trash/spray-bottle.png",
    category: "yellow",
    reason:
      "Botol semprot plastik dapat didaur ulang setelah dibersihkan. Pastikan tidak mengandung sisa bahan kimia berbahaya.",
  },
  {
    id: "baby_feeder",
    name: "Botol Susu Bayi",
    image: "/trash/baby-feeder.png",
    category: "yellow",
    reason:
      "Botol susu bayi berbahan plastik bisa didaur ulang setelah dicuci bersih. Masukkan ke bin Kuning.",
  },
  {
    id: "milk_bottle",
    name: "Botol Susu",
    image: "/trash/milk-bottle.png",
    category: "yellow",
    reason: "Botol susu plastik/kaca dapat didaur ulang setelah dibersihkan.",
  },
  {
    id: "takeaway_box",
    name: "Kotak Makanan",
    image: "/trash/takeaway.png",
    category: "yellow",
    reason:
      "Kemasan makanan sekali pakai dapat didaur ulang setelah dibersihkan.",
  },
  {
    id: "plastic_bag",
    name: "Kantong Plastik",
    image: "/trash/plastic-bag.png",
    category: "yellow",
    reason:
      "Plastik dapat didaur ulang, hindari mencampurnya dengan sampah organik.",
  },
  {
    id: "no_plastic_straw",
    name: "Sedotan Plastik",
    image: "/trash/no-plastic.png",
    category: "yellow",
    reason: "Sedotan plastik bisa didaur ulang, sebaiknya dipisahkan.",
  },
  {
    id: "tshirt",
    name: "Kaos Bekas",
    image: "/trash/tshirt.png",
    category: "yellow",
    reason:
      "Kain dapat digunakan kembali atau didaur ulang menjadi produk lain.",
  },
  {
    id: "pants",
    name: "Celana Bekas",
    image: "/trash/pants.png",
    category: "yellow",
    reason: "Pakaian bekas dapat digunakan kembali atau didaur ulang.",
  },
  {
    id: "magazine",
    name: "Majalah",
    image: "/trash/magazine.png",
    category: "yellow",
    reason: "Kertas dapat didaur ulang setelah dipisahkan dari sampah lain.",
  },
  {
    id: "papers",
    name: "Kertas",
    image: "/trash/papers.png",
    category: "yellow",
    reason: "Kertas bekas bisa didaur ulang.",
  },
  {
    id: "letter",
    name: "Amplop",
    image: "/trash/letter.png",
    category: "yellow",
    reason: "Amplop berbahan kertas dapat didaur ulang.",
  },
  {
    id: "jar",
    name: "Toples Kaca",
    image: "/trash/jar.png",
    category: "yellow",
    reason: "Kaca dapat digunakan ulang atau didaur ulang.",
  },
  {
    id: "kaleng_minuman",
    name: "Kaleng Minuman",
    image: "/trash/soda.png",
    category: "blue",
    reason: "Kaleng minuman dapat didaur ulang, bersihkan dulu.",
  },
  {
    id: "wine_bottle",
    name: "Botol Kaca",
    image: "/trash/wine-bottle.png",
    category: "blue",
    reason: "Botol kaca dapat didaur ulang atau digunakan kembali.",
  },
  {
    id: "cutlery",
    name: "Sendok Garpu",
    image: "/trash/cutlery.png",
    category: "blue",
    reason: "Sendok dan garpu logam dapat dilebur dan didaur ulang.",
  },

  // 🔴 B3 / Berbahaya
  {
    id: "baterai_aa",
    name: "Baterai",
    image: "/trash/battery.png",
    category: "red",
    reason:
      "Baterai mengandung bahan berbahaya (B3) sehingga harus dipisahkan di bin Merah dan tidak boleh dicampur dengan sampah biasa.",
  },
  {
    id: "medicine",
    name: "Obat-obatan",
    image: "/trash/medicine.png",
    category: "red",
    reason:
      "Obat bekas atau kedaluwarsa harus dibuang ke fasilitas limbah medis.",
  },
  {
    id: "lampu",
    name: "Lampu Bekas",
    image: "/trash/lampu.png",
    category: "red",
    reason:
      "Mengandung material berbahaya seperti merkuri, buang di bin Merah.",
  },
  {
    id: "sanitary_napkin",
    name: "Pembalut",
    image: "/trash/sanitary-napkin.png",
    category: "red",
    reason: "Sampah medis yang perlu dibuang terpisah di bin Merah.",
  },
  {
    id: "bantal",
    name: "Bantal Bekas",
    image: "/trash/pillow.png",
    category: "red",
    reason:
      "Bantal bekas termasuk sampah residu/B3 karena sulit didaur ulang dan dapat menjadi sarang debu atau jamur. Masukkan ke bin Merah atau bawa ke fasilitas pengolahan limbah tekstil.",
  },
  {
    id: "selimut",
    name: "Selimut",
    image: "/trash/selimut.png",
    category: "red",
    reason:
      "Selimut bekas termasuk sampah residu/B3 karena sulit didaur ulang dan dapat menjadi sarang debu atau jamur. Masukkan ke bin Merah atau bawa ke fasilitas pengolahan limbah tekstil.",
  },
  {
    id: "oil",
    name: "Minyak Goreng Bekas",
    image: "/trash/oil.png",
    category: "red",
    reason: "Minyak bekas masuk limbah B3, jangan dibuang ke saluran air.",
  },
  {
    id: "tv",
    name: "Televisi",
    image: "/trash/television.png",
    category: "red",
    reason:
      "Mengandung logam berat (seperti timbal, merkuri, kadmium) dan komponen berbahaya di papan PCB.",
  },
  {
    id: "diaper",
    name: "Pempers",
    image: "/trash/diaper.png",
    category: "red",
    reason:
      "Harus dibuang ke bin merah / residu atau dibawa ke fasilitas pengolahan limbah medis/infeksius bila tersedia.",
  },
];

export default trashData;
