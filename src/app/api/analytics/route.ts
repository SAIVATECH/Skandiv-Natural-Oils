import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET core analytics dashboard stats
 * Path: GET /api/analytics
 */
export async function GET() {
  try {
    // 1. Calculate General Card Metrics
    const paidOrders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalAmount: true },
    });

    const totalRevenue = paidOrders.reduce((sum: number, o: { totalAmount: any }) => sum + Number(o.totalAmount), 0);
    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const lowStockCount = await prisma.product.count({ where: { stock: { lte: 5 } } });

    // 2. Aggregate Sales Trend (Past 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Group sales by day
    const salesByDayMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      salesByDayMap.set(dateStr, 0);
    }

    recentOrders.forEach((order: { createdAt: Date; totalAmount: any }) => {
      const dateStr = order.createdAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (salesByDayMap.has(dateStr)) {
        salesByDayMap.set(dateStr, (salesByDayMap.get(dateStr) || 0) + Number(order.totalAmount));
      }
    });

    const salesTrend = Array.from(salesByDayMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    // 3. Category Breakdown (Total Revenue per Category)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { paymentStatus: 'PAID' },
      },
      include: {
        product: {
          select: { category: true },
        },
      },
    });

    const categoryMap = new Map<string, number>();
    orderItems.forEach((item: any) => {
      const cat = item.product.category || 'Uncategorized';
      const itemRev = Number(item.price) * item.quantity;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + itemRev);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    // 4. Bestselling Products
    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    const soldItems = await prisma.orderItem.findMany({
      where: { order: { paymentStatus: 'PAID' } },
      include: { product: true },
    });

    soldItems.forEach((item: any) => {
      const prod = item.product;
      const itemRev = Number(item.price) * item.quantity;

      if (productSalesMap.has(prod.id)) {
        const existing = productSalesMap.get(prod.id)!;
        existing.quantity += item.quantity;
        existing.revenue += itemRev;
      } else {
        productSalesMap.set(prod.id, {
          name: prod.name,
          quantity: item.quantity,
          revenue: itemRev,
        });
      }
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 5. Repeat Customer Rate
    const customerOrdersCount = await prisma.order.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { paymentStatus: 'PAID' },
    });

    const totalPaidCustomers = customerOrdersCount.length;
    const repeatCustomers = customerOrdersCount.filter((c: any) => c._count.id > 1).length;
    const repeatCustomerRate = totalPaidCustomers > 0 
      ? Math.round((repeatCustomers / totalPaidCustomers) * 100) 
      : 0;

    return NextResponse.json({
      cards: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        lowStockCount,
        repeatCustomerRate,
      },
      salesTrend,
      categoryBreakdown,
      topProducts,
    });
  } catch (error) {
    console.error('[API Analytics GET Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
