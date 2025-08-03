import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface PaymentPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
}

const PaymentScreen = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('zalopay');
  const [loading, setLoading] = useState(false);

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'daily',
      name: 'Gói Ngày',
      duration: '1 ngày',
      price: 5000,
      features: [
        'Tạo flashcards không giới hạn',
        'AI hỗ trợ học tập',
        'Ghi chú thông minh',
        'Thống kê học tập',
      ],
    },
    {
      id: 'monthly',
      name: 'Gói Tháng',
      duration: '30 ngày',
      price: 99000,
      originalPrice: 150000,
      popular: true,
      features: [
        'Tất cả tính năng gói ngày',
        'Đồng bộ đa thiết bị',
        'Backup dữ liệu',
        'Hỗ trợ ưu tiên',
        'Không quảng cáo',
      ],
    },
    {
      id: 'yearly',
      name: 'Gói Năm',
      duration: '365 ngày',
      price: 999000,
      originalPrice: 1188000,
      features: [
        'Tất cả tính năng gói tháng',
        'Tính năng AI nâng cao',
        'Phân tích học tập chi tiết',
        'Tư vấn học tập cá nhân',
        'Ưu đãi đặc biệt',
      ],
    },
  ];

  const paymentMethods = [
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: 'card-outline',
      color: '#0068FF',
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: 'card-outline',
      color: '#1E88E5',
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handlePayment = async () => {
    const plan = paymentPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Thanh toán thành công!',
        `Bạn đã đăng ký ${plan.name} thành công. Tính năng premium đã được kích hoạt.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanCard = (plan: PaymentPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlan,
        plan.popular && styles.popularPlan,
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>PHỔ BIẾN</Text>
        </View>
      )}
      
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planDuration}>{plan.duration}</Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatPrice(plan.price)}</Text>
        {plan.originalPrice && (
          <Text style={styles.originalPrice}>{formatPrice(plan.originalPrice)}</Text>
        )}
      </View>
      
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      {selectedPlan === plan.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedPaymentMethod(method.id)}
    >
      <View style={styles.paymentMethodContent}>
        <Ionicons name={method.icon} size={24} color={method.color} />
        <Text style={styles.paymentMethodName}>{method.name}</Text>
      </View>
      {selectedPaymentMethod === method.id && (
        <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nâng cấp Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Chọn gói đăng ký</Text>
        <View style={styles.plansContainer}>
          {paymentPlans.map(renderPlanCard)}
        </View>

        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
          {(() => {
            const plan = paymentPlans.find(p => p.id === selectedPlan);
            const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
            return (
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Gói:</Text>
                  <Text style={styles.summaryValue}>{plan?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Thời hạn:</Text>
                  <Text style={styles.summaryValue}>{plan?.duration}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Thanh toán:</Text>
                  <Text style={styles.summaryValue}>{method?.name}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalValue}>{formatPrice(plan?.price || 0)}</Text>
                </View>
              </View>
            );
          })()}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Thanh toán ngay</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#2196F3',
  },
  popularPlan: {
    borderColor: '#FF9800',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2196F3',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethod: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPaymentMethod: {
    borderColor: '#2196F3',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  payButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
