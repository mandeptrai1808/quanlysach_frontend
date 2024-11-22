<template>
  <div class="about-page">
    <h1>Giới Thiệu</h1>
    <p>
      Chào mừng bạn đến với Hệ Thống Quản Lý Thư Viện - một giải pháp toàn diện được thiết kế để tối ưu hóa việc quản lý và mượn trả sách tại thư viện. Hệ thống của chúng tôi kết hợp các tính năng quản lý thư viện mạnh mẽ với giao diện người dùng trực quan, giúp việc tìm kiếm và mượn sách trở nên dễ dàng hơn bao giờ hết.
    </p>
    <p>
      Được xây dựng bằng Vue.js và các công nghệ web hiện đại, nền tảng của chúng tôi cung cấp khả năng cập nhật theo thời gian thực, tổ chức sách một cách hệ thống, và theo dõi quá trình mượn trả hiệu quả. Cho dù bạn là độc giả đang tìm kiếm sách hay thủ thư quản lý thư viện, hệ thống của chúng tôi đều cung cấp các công cụ cần thiết để đáp ứng nhu cầu của bạn.
    </p>
    <p>
      Các tính năng chính bao gồm: tìm kiếm sách theo nhiều tiêu chí, quản lý mượn trả, theo dõi tình trạng sách, quản lý thông tin độc giả, và báo cáo thống kê chi tiết. Chúng tôi đã thiết kế mọi khía cạnh của ứng dụng với trải nghiệm người dùng là ưu tiên hàng đầu, đảm bảo rằng bạn có thể tập trung vào việc quan trọng nhất - truy cập và sử dụng nguồn tài nguyên thư viện một cách hiệu quả.
    </p>
    <div class="creators-section">
      <h2>Đội Ngũ Phát Triển</h2>
      <div class="creator">
        <img
          src="https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/465904196_1926624974415681_8494357108942021193_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHgd2y_drwQtpKQIjMJ28CyLgM6pWQb7Y8uAzqlZBvtj0Vpue-JjMJPlipUepXmi0CRY_8vi8hLP9T0hnOml5Nd&_nc_ohc=BwC6x7dedPAQ7kNvgGHw67X&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=AcIg6fcNUaIIqldHcrxUhws&oh=00_AYAXP_B7ejMG8zlmigZEmtgIEtnTRV6JC_Ji0xY-rsxylw&oe=674577B0"
          alt="Van Man"
          class="creator-image"
        />
        <div class="creator-info">
          <p class="creator-name">Nguyễn Văn Mặn</p>
          <p class="creator-role">Nhà Phát Triển Chính</p>
          <p class="creator-email">vanman12315@gmail.com</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.about-page h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.about-page p {
  font-size: 1rem;
  margin-bottom: 20px;
  text-align: justify;
}

.creators-section {
  margin-top: 40px;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.creators-section h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.creator {
  display: flex;
  align-items: center;
  margin: 20px auto;
  max-width: 500px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.creator-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-right: 20px;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.creator-role {
  font-size: 1rem;
  color: #555;
  margin: 0 0 5px 0;
}

.creator-email {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}
</style>
  