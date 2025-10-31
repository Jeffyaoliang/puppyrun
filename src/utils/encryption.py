"""
数据加密工具类
使用AES-256加密敏感数据
"""
import base64
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import os


class EncryptionUtil:
    """加密工具类"""
    
    # AES-256密钥（实际应从环境变量或KMS获取）
    AES_KEY_SIZE = 32  # 256 bits
    BLOCK_SIZE = 16
    
    def __init__(self, key: bytes = None):
        """
        初始化加密工具
        
        Args:
            key: AES密钥，如果为None则从环境变量获取
        """
        if key is None:
            key_str = os.getenv('AES_ENCRYPTION_KEY')
            if not key_str:
                raise ValueError("AES加密密钥未配置")
            # 确保密钥长度为32字节
            key = hashlib.sha256(key_str.encode()).digest()
        
        if len(key) != self.AES_KEY_SIZE:
            raise ValueError(f"AES密钥长度必须为{self.AES_KEY_SIZE}字节")
        
        self.key = key
    
    def encrypt(self, plaintext: str) -> str:
        """
        加密字符串
        
        Args:
            plaintext: 明文
            
        Returns:
            加密后的base64字符串
        """
        # 生成随机IV
        iv = get_random_bytes(self.BLOCK_SIZE)
        
        # 创建AES cipher
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        
        # 加密
        padded_data = pad(plaintext.encode('utf-8'), self.BLOCK_SIZE)
        ciphertext = cipher.encrypt(padded_data)
        
        # 组合IV和密文
        encrypted_data = iv + ciphertext
        
        # Base64编码
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    def decrypt(self, ciphertext: str) -> str:
        """
        解密字符串
        
        Args:
            ciphertext: base64编码的密文
            
        Returns:
            解密后的明文
        """
        # Base64解码
        encrypted_data = base64.b64decode(ciphertext)
        
        # 提取IV和密文
        iv = encrypted_data[:self.BLOCK_SIZE]
        ciphertext = encrypted_data[self.BLOCK_SIZE:]
        
        # 创建AES cipher
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        
        # 解密
        padded_data = cipher.decrypt(ciphertext)
        plaintext = unpad(padded_data, self.BLOCK_SIZE)
        
        return plaintext.decode('utf-8')
    
    def hash_sensitive_data(self, data: str) -> str:
        """
        对敏感数据进行哈希（用于证件验证）
        
        Args:
            data: 敏感数据
            
        Returns:
            SHA256哈希值（hex格式）
        """
        return hashlib.sha256(data.encode('utf-8')).hexdigest()
    
    @staticmethod
    def mask_phone(phone: str) -> str:
        """
        脱敏手机号（显示前3位和后4位）
        
        Args:
            phone: 手机号
            
        Returns:
            脱敏后的手机号
        """
        if len(phone) < 7:
            return phone
        return phone[:3] + '****' + phone[-4:]
    
    @staticmethod
    def mask_wechat(wechat: str) -> str:
        """
        脱敏微信号
        
        Args:
            wechat: 微信号
            
        Returns:
            脱敏后的微信号
        """
        if len(wechat) <= 4:
            return '*' * len(wechat)
        return wechat[:2] + '*' * (len(wechat) - 4) + wechat[-2:]
