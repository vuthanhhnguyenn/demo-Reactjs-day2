import type { Position } from "./position.schema";

export const mockPositions: Position[] = [
  {
    id: 1,
    role: "headquarter",
    position_name: "Quản trị trụ sở",
    features: {
      description: "Toàn quyền quản trị hệ thống và cấu hình nghiệp vụ.",
      manage_staffs: true,
      manage_positions: true,
    },
  },
  {
    id: 2,
    role: "manager",
    position_name: "Quản lý cửa hàng",
    features: {
      description: "Quản lý nhân viên và hoạt động của cửa hàng.",
      view_reports: true,
      manage_schedules: true,
    },
  },
  {
    id: 3,
    role: "staff",
    position_name: "Nhân viên bán hàng",
    features: {
      description: "Xử lý nghiệp vụ bán hàng hằng ngày.",
      create_orders: true,
      view_customers: true,
    },
  },
  {
    id: 4,
    role: "trainer",
    position_name: "Chuyên viên đào tạo",
    features: {
      description: "Theo dõi và triển khai chương trình đào tạo.",
      manage_training: true,
      view_staffs: true,
    },
  },
  {
    id: 5,
    role: "observer",
    position_name: "Quan sát viên",
    features: {
      description: "Chỉ xem dữ liệu phục vụ việc giám sát.",
      view_reports: true,
      edit_data: false,
    },
  },
];
