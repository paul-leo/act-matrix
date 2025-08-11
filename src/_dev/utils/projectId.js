/**
 * 从 project-config.json 文件中提取项目 ID
 * @returns {Promise<string|null>} 项目 ID 或 null（如果未找到）
 */
export async function extractProjectId() {
  try {
    // 使用动态导入 JSON 文件，添加 import assertion
    const configModule = await import('../project-config.json');
    const config = configModule.default;
    
    if (config && config.projectId) {
      return config.projectId;
    }
    
    return null;
  } catch (error) {
    console.warn('读取项目配置失败，可能文件不存在:', error.message);
    return null;
  }
}

/**
 * 获取项目 ID，如果不存在则返回默认值和警告信息
 * @returns {Promise<{id: string, hasWarning: boolean, warningMessage?: string}>}
 */
export async function getProjectIdWithWarning() {
  const projectId = await extractProjectId();
  
  if (!projectId) {
    return {
      id: 'no-project-id',
      hasWarning: true,
      warningMessage: '未找到项目 ID，请运行 "npm run generate-id" 生成项目唯一标识'
    };
  }
  
  return {
    id: projectId,
    hasWarning: false
  };
}
