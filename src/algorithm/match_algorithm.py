"""
匹配算法核心实现
"""
import math
from typing import Dict, List, Tuple
from dataclasses import dataclass


@dataclass
class UserProfile:
    """用户画像"""
    uid: int
    interests: List[str]
    social_needs: List[str]
    values: Dict[str, str]
    appearance_pref: Dict[str, str]
    ai_scores: Dict[str, float]
    city: str
    schedule: str
    role: str
    asset_flag: bool = False
    member_level: str = 'normal'


@dataclass
class MatchResult:
    """匹配结果"""
    total_score: float
    detail_scores: Dict[str, float]
    match_reasons: List[str]


class MatchAlgorithm:
    """匹配算法核心类"""
    
    # 权重配置
    WEIGHTS = {
        'interest': 0.4,
        'needs': 0.3,
        'values': 0.2,
        'appearance': 0.1
    }
    
    # 需求互补映射
    NEEDS_COMPLEMENT = {
        '陪伴聊天': ['陪伴聊天', '线下活动'],
        '线下活动': ['线下活动', '兴趣组队'],
        '职业交流': ['职业交流', '资源对接'],
        '兴趣组队': ['兴趣组队', '线下活动']
    }
    
    # 价值观维度
    VALUE_DIMENSIONS = {
        'consumption': ['理性消费', '适度消费', '享受消费'],
        'boundary': ['严格边界', '适度边界', '开放边界'],
        'communication': ['直接沟通', '委婉沟通', '灵活沟通']
    }
    
    def calculate_match_score(self, user_a: UserProfile, user_b: UserProfile) -> MatchResult:
        """
        计算用户A和用户B的匹配分数
        
        Args:
            user_a: 用户A的画像
            user_b: 用户B的画像
            
        Returns:
            MatchResult: 匹配结果
        """
        scores = {}
        
        # 1. 兴趣重合度（权重40%）
        interest_score = self._calculate_interest_overlap(
            user_a.interests, 
            user_b.interests
        )
        scores['interest'] = interest_score * self.WEIGHTS['interest']
        
        # 2. 社交需求契合度（权重30%）
        needs_score = self._calculate_needs_compatibility(
            user_a.social_needs,
            user_b.social_needs
        )
        scores['needs'] = needs_score * self.WEIGHTS['needs']
        
        # 3. 价值观相似度（权重20%）
        values_score = self._calculate_values_similarity(
            user_a.values,
            user_b.values
        )
        scores['values'] = values_score * self.WEIGHTS['values']
        
        # 4. AI外貌匹配度（权重10%）
        appearance_score = self._calculate_appearance_match(
            user_a.ai_scores,
            user_b.ai_scores,
            user_a.appearance_pref,
            user_b.appearance_pref
        )
        scores['appearance'] = appearance_score * self.WEIGHTS['appearance']
        
        # 5. 基础匹配度（加分项）
        base_bonus = self._calculate_base_bonus(user_a, user_b)
        
        # 总分计算
        total_score = sum(scores.values()) + base_bonus
        total_score = min(100, max(0, total_score))
        
        # 匹配原因生成
        match_reasons = self._generate_match_reasons(scores, user_a, user_b)
        
        return MatchResult(
            total_score=total_score,
            detail_scores=scores,
            match_reasons=match_reasons
        )
    
    def _calculate_interest_overlap(self, interests_a: List[str], interests_b: List[str]) -> float:
        """计算兴趣重合度"""
        set_a = set(interests_a)
        set_b = set(interests_b)
        
        # Jaccard相似度
        intersection = len(set_a & set_b)
        union = len(set_a | set_b)
        jaccard = intersection / union if union > 0 else 0
        
        # 排序权重（前3个兴趣权重更高）
        weight_sum = 0
        for i, interest in enumerate(interests_a[:3]):
            if interest in interests_b:
                weight = 3 - i  # 第一个兴趣权重3，第二个2，第三个1
                weight_sum += weight
        
        max_weight = 6  # 3+2+1
        weight_score = weight_sum / max_weight if max_weight > 0 else 0
        
        # 综合分数（Jaccard 70% + 权重 30%）
        score = jaccard * 0.7 + weight_score * 0.3
        
        return score * 100  # 转换为0-100分
    
    def _calculate_needs_compatibility(self, needs_a: List[str], needs_b: List[str]) -> float:
        """计算社交需求契合度"""
        set_a = set(needs_a)
        set_b = set(needs_b)
        
        # 直接匹配度
        intersection = len(set_a & set_b)
        union = len(set_a | set_b)
        direct_match = intersection / union if union > 0 else 0
        
        # 需求互补性
        complement_score = 0
        for need_a in needs_a:
            if need_a in self.NEEDS_COMPLEMENT:
                compatible_needs = self.NEEDS_COMPLEMENT[need_a]
                if any(need in needs_b for need in compatible_needs):
                    complement_score += 1
        
        max_complement = len(needs_a)
        complement_ratio = complement_score / max_complement if max_complement > 0 else 0
        
        # 综合分数（直接匹配60% + 互补40%）
        score = direct_match * 0.6 + complement_ratio * 0.4
        
        return score * 100
    
    def _calculate_values_similarity(self, values_a: Dict[str, str], values_b: Dict[str, str]) -> float:
        """计算价值观相似度"""
        vec_a = []
        vec_b = []
        
        for dim, options in self.VALUE_DIMENSIONS.items():
            val_a = values_a.get(dim, '')
            val_b = values_b.get(dim, '')
            
            # 计算该维度的相似度
            if val_a == val_b:
                similarity = 1.0
            elif val_a in options and val_b in options:
                idx_a = options.index(val_a)
                idx_b = options.index(val_b)
                # 距离越近，相似度越高
                distance = abs(idx_a - idx_b)
                max_distance = len(options) - 1
                similarity = 1.0 - (distance / max_distance) if max_distance > 0 else 0
            else:
                similarity = 0.5  # 默认中等相似度
            
            vec_a.append(similarity)
            vec_b.append(similarity)
        
        # 余弦相似度
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = sum(a * a for a in vec_a) ** 0.5
        norm_b = sum(b * b for b in vec_b) ** 0.5
        
        cosine_sim = dot_product / (norm_a * norm_b) if (norm_a * norm_b) > 0 else 0
        
        return cosine_sim * 100
    
    def _calculate_appearance_match(
        self, 
        scores_a: Dict[str, float], 
        scores_b: Dict[str, float],
        pref_a: Dict[str, str],
        pref_b: Dict[str, str]
    ) -> float:
        """计算AI外貌匹配度"""
        # AI评分维度
        ai_dimensions = ['气质匹配度', '风格契合度', '整体协调度']
        
        # 计算双方AI评分的匹配度
        match_scores = []
        for dim in ai_dimensions:
            score_a = scores_a.get(dim, 5.0)  # 默认5分
            score_b = scores_b.get(dim, 5.0)
            
            # 分数越接近，匹配度越高
            diff = abs(score_a - score_b)
            match_score = 1.0 - (diff / 10.0)  # 最大差异10分
            match_scores.append(max(0, match_score))
        
        ai_match = sum(match_scores) / len(match_scores) if match_scores else 0
        
        # 偏好匹配度
        style_a = pref_a.get('style', '')
        style_b = pref_b.get('style', '')
        
        pref_match = 0.5  # 默认中等匹配
        if style_a and style_b:
            if style_a == style_b:
                pref_match = 1.0
            else:
                # 风格兼容性矩阵
                compatible_styles = {
                    '休闲': ['休闲', '运动'],
                    '正式': ['正式', '商务'],
                    '运动': ['运动', '休闲']
                }
                if style_b in compatible_styles.get(style_a, []):
                    pref_match = 0.8
        
        # 综合分数（AI匹配70% + 偏好30%）
        score = ai_match * 0.7 + pref_match * 0.3
        
        return score * 100
    
    def _calculate_base_bonus(self, user_a: UserProfile, user_b: UserProfile) -> float:
        """计算基础匹配加分项"""
        bonus = 0
        
        # 同城加分
        if user_a.city == user_b.city:
            bonus += 5
        
        # 作息匹配加分
        if user_a.schedule == user_b.schedule:
            bonus += 3
        
        # 资产证明加分（仅对女生）
        if user_b.role == 'female' and user_b.asset_flag:
            bonus += 2
        
        # 会员加分
        if user_a.member_level != 'normal':
            bonus += 2
        if user_b.member_level != 'normal':
            bonus += 2
        
        return min(10, bonus)  # 最高加10分
    
    def _generate_match_reasons(
        self, 
        scores: Dict[str, float], 
        user_a: UserProfile, 
        user_b: UserProfile
    ) -> List[str]:
        """生成匹配原因"""
        reasons = []
        
        # 兴趣匹配原因
        common_interests = set(user_a.interests) & set(user_b.interests)
        if common_interests:
            reasons.append(f"共同兴趣：{', '.join(list(common_interests)[:3])}")
        
        # 需求匹配原因
        common_needs = set(user_a.social_needs) & set(user_b.social_needs)
        if common_needs:
            reasons.append(f"共同需求：{', '.join(list(common_needs)[:2])}")
        
        # 价值观匹配原因
        if scores['values'] > 70:
            reasons.append("价值观高度契合")
        
        # 地理优势
        if user_a.city == user_b.city:
            reasons.append("同城匹配")
        
        return reasons[:3]  # 最多返回3个原因
    
    def rerank_candidates(
        self, 
        candidates: List[Dict], 
        user_id: int
    ) -> List[Dict]:
        """
        重排序候选列表，保证多样性
        
        Args:
            candidates: 候选用户列表
            user_id: 当前用户ID
            
        Returns:
            重排序后的候选列表
        """
        # 1. 按匹配分数排序
        candidates.sort(key=lambda x: x.get('match_score', 0), reverse=True)
        
        # 2. 多样性惩罚（避免推荐同质化用户）
        reranked = []
        seen_tags = set()
        
        for candidate in candidates:
            # 计算多样性得分
            candidate_tags = set(candidate.get('tags', []))
            overlap = len(candidate_tags & seen_tags)
            diversity_penalty = overlap * 0.1  # 每个重叠标签扣0.1分
            
            # 应用惩罚
            final_score = candidate.get('match_score', 0) - diversity_penalty
            
            reranked.append({
                **candidate,
                'final_score': final_score
            })
            
            seen_tags.update(candidate_tags)
        
        # 3. 按最终分数重新排序
        reranked.sort(key=lambda x: x.get('final_score', 0), reverse=True)
        
        return reranked[:10]  # 返回Top-10
