// 연락처별 거래 인사이트 — 향후 tnt-mall DB 연동 자리.
// 지금은 빈 객체 리턴, tnt-mall 셋업 후 이 함수 본문만 교체하면 됨.
// 매칭 키: phone (정규화 후 끝 8자리)

export interface CustomerInsights {
  connected: boolean; // tnt-mall에 매칭되는 고객이 있는지
  member?: {
    level_name: string;
    total_spent: number;
    order_count: number;
    last_order_at: string | null;
  };
  summary: {
    total_orders: number;
    total_spent: number;
    avg_order_value: number;
    last_order_at: string | null;
  };
  top_products: {
    prod_cd: string;
    name: string;
    image?: string;
    purchase_count: number;
  }[];
  recent_orders: {
    id: string;
    ordered_at: string;
    total: number;
    status: string;
    item_summary: string;
  }[];
}

export async function fetchCustomerInsights(_phone: string | null | undefined): Promise<CustomerInsights> {
  // TODO: tnt-mall DB 셋업 후 phone으로 User 조회 → orders/order_items 집계
  return {
    connected: false,
    summary: { total_orders: 0, total_spent: 0, avg_order_value: 0, last_order_at: null },
    top_products: [],
    recent_orders: [],
  };
}
