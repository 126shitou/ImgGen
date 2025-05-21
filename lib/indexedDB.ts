// IndexedDB工具类，用于存储和检索图片文件
export class ImageStorage {
  private dbName: string = 'imageGenDB';
  private storeName: string = 'imageFiles';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  // 初始化数据库
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject('无法打开IndexedDB');
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储，使用id作为键
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  // 从URL获取图片文件并存储到IndexedDB
  async storeImageFromUrl(imageUrl: string, metadata: any = {}): Promise<string> {
    try {
      // 获取图片文件
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('获取图片文件失败');
      }
      
      // 将图片文件转换为Blob
      const imageBlob = await response.blob();
      
      // 生成唯一ID
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // 存储图片文件
      await this.storeImage(imageId, imageBlob, metadata);
      
      return imageId;
    } catch (error) {
      console.error('存储图片文件失败:', error);
      throw error;
    }
  }
  
  // 直接存储Blob到IndexedDB的公共方法
  async storeImageBlob(imageBlob: Blob, metadata: any = {}): Promise<string> {
    try {
      // 生成唯一ID
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // 存储图片文件
      await this.storeImage(imageId, imageBlob, metadata);
      
      return imageId;
    } catch (error) {
      console.error('存储图片文件失败:', error);
      throw error;
    }
  }

  // 存储图片文件到IndexedDB
  private async storeImage(id: string, imageBlob: Blob, metadata: any = {}): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const imageData = {
        id,
        blob: imageBlob,
        createdAt: new Date(),
        ...metadata
      };
      
      const request = store.put(imageData);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('存储图片失败:', event);
        reject('存储图片失败');
      };
    });
  }

  // 从IndexedDB获取图片文件
  async getImage(id: string): Promise<{ blob: Blob, metadata: any } | null> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          const { blob, ...metadata } = data;
          resolve({ blob, metadata });
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (event) => {
        console.error('获取图片失败:', event);
        reject('获取图片失败');
      };
    });
  }

  // 创建图片URL
  createImageUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  // 列出所有存储的图片
  async listAllImages(): Promise<Array<{ id: string, metadata: any }>> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        const imageFiles = request.result.map(item => {
          const { blob, ...metadata } = item;
          return { id: item.id, metadata };
        });
        
        resolve(imageFiles);
      };
      
      request.onerror = (event) => {
        console.error('获取图片列表失败:', event);
        reject('获取图片列表失败');
      };
    });
  }

  // 更新图片元数据，不更新blob
  async updateImageMetadata(id: string, metadata: any): Promise<void> {
    const db = await this.initDB();
    
    return new Promise(async (resolve, reject) => {
      try {
        // 首先获取现有图片数据
        const imageData = await this.getImage(id);
        if (!imageData) {
          throw new Error('图片数据不存在');
        }
        
        // 创建事务
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // 合并现有数据和新元数据，保留blob
        const updatedData = {
          id,
          blob: imageData.blob,
          ...metadata
        };
        
        // 存储更新后的数据
        const request = store.put(updatedData);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error('更新图片元数据失败:', event);
          reject('更新图片元数据失败');
        };
      } catch (error) {
        console.error('更新图片元数据失败:', error);
        reject(error);
      }
    });
  }

  // 删除图片
  async deleteImage(id: string): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('删除图片失败:', event);
        reject('删除图片失败');
      };
    });
  }
}

// 创建单例实例
let imageStorageInstance: ImageStorage | null = null;

export function getImageStorage(): ImageStorage {
  if (typeof window === 'undefined') {
    // 服务器端返回一个空对象
    return {} as ImageStorage;
  }
  
  if (!imageStorageInstance) {
    imageStorageInstance = new ImageStorage();
  }
  
  return imageStorageInstance;
}
