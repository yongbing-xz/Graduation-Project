<!--
NotFound.vue - 404页面组件
功能：
1. 处理路由不存在的情况，显示友好的404错误信息
2. 提供返回首页和上一页的导航按钮
3. 给出用户可能的解决建议
-->
  <div class="not-found">
    <div class="error-container">
      <div class="error-content">
        <div class="error-code">404</div>
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            <el-icon><home-filled /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><arrow-left /></el-icon>
            返回上一页
          </el-button>
        </div>
        <div class="error-tips">
          <p>您可以尝试以下操作：</p>
          <ul>
            <li>检查URL地址是否正确</li>
            <li>使用搜索功能查找相关内容</li>
            <li>联系管理员获取帮助</li>
          </ul>
        </div>
      </div>
      <div class="error-illustration">
        <div class="illustration">
          <div class="computer">
            <div class="screen">
              <div class="error-icon">
                <el-icon><warning /></el-icon>
              </div>
            </div>
            <div class="keyboard"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeFilled, ArrowLeft, Warning } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 60px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.error-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
  margin-bottom: 20px;
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
}

.error-tips {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.error-tips p {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
}

.error-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.error-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration {
  position: relative;
  width: 300px;
  height: 200px;
}

.computer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 150px;
}

.screen {
  width: 180px;
  height: 120px;
  background: #f0f0f0;
  border-radius: 8px 8px 0 0;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.error-icon {
  font-size: 48px;
  color: #ff6b6b;
}

.keyboard {
  width: 200px;
  height: 30px;
  background: #ddd;
  border-radius: 0 0 8px 8px;
  margin-top: -2px;
}

/* 动画效果 */
.error-code {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-container {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 40px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .illustration {
    width: 200px;
    height: 150px;
  }
  
  .computer {
    width: 150px;
    height: 120px;
  }
  
  .screen {
    width: 140px;
    height: 90px;
  }
  
  .keyboard {
    width: 150px;
  }
}

@media (max-width: 480px) {
  .error-container {
    padding: 30px 20px;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .error-actions .el-button {
    width: 100%;
  }
}
</style>