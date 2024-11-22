import { reactive } from 'vue';
import mitt from 'mitt';

// Tạo một event bus sử dụng mitt
export const eventBus = mitt();

// Global state để lưu trữ trạng thái người dùng
export const userState = reactive({
  user: null,
});
