<template>
  <div class="maintenance-container">
    <div class="maintenance-content">
      <div class="icon-wrapper">
        <svg class="maintenance-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="title">系统维护中</h1>
      <p class="message">{{ message }}</p>
      <p class="sub-message">感谢您的耐心等待！</p>
      <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>
      <button @click="refreshPage" class="refresh-btn" :disabled="isLoading">
        {{ isLoading ? '检查中...' : '刷新页面' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { systemApi } from '@/api/anime'

const router = useRouter()
const isLoading = ref(false)
const statusMessage = ref('')
const message = ref('我们正在对系统进行升级维护，预计将在短时间内恢复服务。')

// 页面加载时获取维护信息
onMounted(async () => {
  try {
    const res = await systemApi.getUpdateStatus()
    if (res && res.data && res.data.message) {
      message.value = res.data.message
    }
  } catch (error) {
    console.log('获取维护信息失败:', error)
  }
})

// 检查服务是否恢复
const checkServiceStatus = async () => {
  try {
    const res = await systemApi.getUpdateStatus()
    // 如果 updating 为 false，说明服务已恢复
    if (res && res.data && !res.data.updating) {
      statusMessage.value = '服务已恢复，正在跳转...'
      setTimeout(() => {
        router.push('/')
      }, 1000)
      return true
    }
  } catch (error) {
    // 如果请求失败，可能是网络问题或服务未恢复
    console.log('Service still unavailable:', error.message)
  }
  return false
}

const refreshPage = async () => {
  isLoading.value = true
  statusMessage.value = '正在检查服务状态...'
  
  const isRecovered = await checkServiceStatus()
  
  if (!isRecovered) {
    // 服务仍未恢复，执行普通刷新
    statusMessage.value = ''
    window.location.reload()
  }
  
  isLoading.value = false
}
</script>

<style scoped>
.maintenance-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.maintenance-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.icon-wrapper {
  margin-bottom: 20px;
}

.maintenance-icon {
  width: 80px;
  height: 80px;
  color: #ff6b6b;
}

.title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

.sub-message {
  font-size: 1rem;
  color: #888;
  margin-bottom: 25px;
}

.refresh-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.refresh-btn:active {
  transform: translateY(0);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.status-message {
  font-size: 0.95rem;
  color: #4CAF50;
  margin-bottom: 15px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .maintenance-content {
    padding: 30px 20px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .message {
    font-size: 1rem;
  }
  
  .maintenance-icon {
    width: 60px;
    height: 60px;
  }
}
</style>