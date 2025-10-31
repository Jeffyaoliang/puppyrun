"""
内容审核工具类
用于检测和拦截违规内容
"""
import re
from typing import List, Tuple, Dict
from enum import Enum


class AuditStatus(Enum):
    """审核状态"""
    PASSED = "passed"
    BLOCKED = "blocked"
    PENDING = "pending"
    WARNING = "warning"


class ContentAuditor:
    """内容审核器"""
    
    # 敏感词词典（实际应从数据库或文件加载）
    SENSITIVE_KEYWORDS = [
        '有偿', '陪聊', '包养', '援交', '一夜情',
        '转账', '红包', '打钱', '付款', '收款',
        '低俗', '色情', '约炮'
    ]
    
    # 联系方式正则模式
    CONTACT_PATTERNS = [
        r'微信号[：:]\s*[a-zA-Z0-9_-]{6,20}',
        r'微信[：:]\s*[a-zA-Z0-9_-]{6,20}',
        r'[a-zA-Z0-9_-]{6,20}\s*微信',
        r'微信\s*[a-zA-Z0-9_-]{6,20}',
        r'[a-zA-Z0-9_-]{6,20}\s*WX',
        r'WX\s*[a-zA-Z0-9_-]{6,20}',
        r'手机[号：:]\s*1[3-9]\d{9}',
        r'电话[号：:]\s*1[3-9]\d{9}',
        r'1[3-9]\d{9}',
        r'QQ[号：:]\s*\d{5,11}',
        r'qq[号：:]\s*\d{5,11}',
    ]
    
    # 金钱交易关键词
    MONEY_TRANSACTION_KEYWORDS = [
        '转账', '打钱', '付款', '收款', '红包',
        '支付宝', '微信支付', '银行卡', '账号'
    ]
    
    def __init__(self):
        """初始化审核器"""
        # 编译正则表达式
        self.contact_regexes = [re.compile(pattern, re.IGNORECASE) for pattern in self.CONTACT_PATTERNS]
    
    def audit_text(self, text: str, user_id: int = None) -> Tuple[AuditStatus, str, Dict]:
        """
        审核文本内容
        
        Args:
            text: 待审核文本
            user_id: 用户ID（用于记录）
            
        Returns:
            (审核状态, 拒绝原因, 详细信息)
        """
        text_lower = text.lower()
        
        # 1. 检测联系方式
        for regex in self.contact_regexes:
            if regex.search(text):
                return (
                    AuditStatus.BLOCKED,
                    "禁止在聊天中发送联系方式",
                    {'reason': 'contact_info', 'pattern': regex.pattern}
                )
        
        # 2. 检测敏感词
        found_keywords = []
        for keyword in self.SENSITIVE_KEYWORDS:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        if found_keywords:
            # 判断是否为金钱交易类
            if any(kw in self.MONEY_TRANSACTION_KEYWORDS for kw in found_keywords):
                return (
                    AuditStatus.BLOCKED,
                    "禁止涉及金钱交易的内容",
                    {'reason': 'money_transaction', 'keywords': found_keywords}
                )
            else:
                return (
                    AuditStatus.BLOCKED,
                    "内容包含敏感词汇",
                    {'reason': 'sensitive_keywords', 'keywords': found_keywords}
                )
        
        # 3. 检测重复内容（可能是垃圾信息）
        if self._is_spam(text):
            return (
                AuditStatus.BLOCKED,
                "加密内容疑似垃圾信息",
                {'reason': 'spam_detected'}
            )
        
        # 审核通过
        return (
            AuditStatus.PASSED,
            "",
            {'reason': 'passed'}
        )
    
    def _is_spam(self, text: str) -> bool:
        """
        检测是否为垃圾信息
        
        Args:
            text: 文本内容
            
        Returns:
            是否为垃圾信息
        """
        # 简单的垃圾检测：重复字符过多
        if len(text) > 50:
            char_counts = {}
            for char in text:
                char_counts[char] = char_counts.get(char, 0) + 1
            
            # 如果某个字符占比超过40%，可能是垃圾信息
            max_ratio = max(char_counts.values()) / len(text)
            if max_ratio > 0.4:
                return True
        
        return False
    
    def extract_contact_info(self, text: str) -> List[str]:
        """
        提取文本中的联系方式（用于记录，不阻止）
        
        Args:
            text: 文本内容
            
        Returns:
            联系方式列表
        """
        contacts = []
        
        for regex in self.contact_regexes:
            matches = regex.findall(text)
            contacts.extend(matches)
        
        return contacts
    
    def get_risk_score(self, text: str) -> float:
        """
        计算文本风险评分（0-100）
        
        Args:
            text: 文本内容
            
        Returns:
            风险评分（0-100）
        """
        score = 0.0
        text_lower = text.lower()
        
        # 联系方式检测（高风险）
        for regex in self.contact_regexes:
            if regex.search(text):
                score += 50
        
        # 敏感词检测
        for keyword in self.SENSITIVE_KEYWORDS:
            if keyword in text_lower:
                score += 10
        
        # 金钱交易关键词（高风险）
        for keyword in self.MONEY_TRANSACTION_KEYWORDS:
            if keyword in text_lower:
                score += 30
        
        return min(100, score)
    
    def audit_image(self, image_url: str, user_id: int = None) -> Tuple[AuditStatus, str]:
        """
        审核图片内容（需要调用第三方API）
        
        Args:
            image_url: 图片URL
            user_id: 用户ID
            
        Returns:
            (审核状态, 拒绝原因)
        """
        # TODO: 接入腾讯内容安全API或其他图片审核服务
        # 这里返回通过，实际应该调用API
        
        # 示例：调用腾讯云内容安全API
        # result = tencent_security_api.check_image(image_url)
        # if result['suggestion'] == 'Block':
        #     return AuditStatus.BLOCKED, result['reason']
        
        return AuditStatus.PASSED, ""
