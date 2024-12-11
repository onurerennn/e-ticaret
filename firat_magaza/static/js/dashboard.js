// Dashboard İstatistikleri ve Grafikleri

class Dashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.initEventListeners();
        this.initCharts();
        this.startAutoRefresh();
    }

    initEventListeners() {
        // Manuel yenileme butonu
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshStats());
        }

        // Tarih filtresi değişikliği
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.refreshStats());
        }
    }

    initCharts() {
        // Satış grafiği
        const salesCtx = document.getElementById('salesChart')?.getContext('2d');
        if (salesCtx) {
            this.charts.sales = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Aylık Satış',
                        data: [],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return new Intl.NumberFormat('tr-TR', {
                                        style: 'currency',
                                        currency: 'TRY'
                                    }).format(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return new Intl.NumberFormat('tr-TR', {
                                        style: 'currency',
                                        currency: 'TRY'
                                    }).format(context.raw);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Kategori dağılımı grafiği
        const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');
        if (categoryCtx) {
            this.charts.category = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(153, 102, 255)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (%${percentage})`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    async refreshStats() {
        try {
            const dateFilter = document.getElementById('dateFilter')?.value || 'all';
            const response = await fetch(`/admin/api/stats?period=${dateFilter}`);
            const data = await response.json();

            if (data.success) {
                this.updateCharts(data);
                this.updateCounters(data);
                showToast('İstatistikler güncellendi', 'success');
            } else {
                throw new Error(data.message || 'Veri alınamadı');
            }
        } catch (error) {
            console.error('Stats refresh error:', error);
            showToast('İstatistikler güncellenirken hata oluştu', 'error');
        }
    }

    updateCharts(data) {
        // Satış grafiği güncelleme
        if (this.charts.sales && data.sales) {
            this.charts.sales.data.labels = data.sales.labels;
            this.charts.sales.data.datasets[0].data = data.sales.data;
            this.charts.sales.update();
        }

        // Kategori grafiği güncelleme
        if (this.charts.category && data.categories) {
            this.charts.category.data.labels = data.categories.labels;
            this.charts.category.data.datasets[0].data = data.categories.data;
            this.charts.category.update();
        }
    }

    updateCounters(data) {
        // İstatistik sayaçlarını güncelle
        const counters = {
            'total-sales': data.totalSales,
            'total-orders': data.totalOrders,
            'total-users': data.totalUsers,
            'total-products': data.totalProducts
        };

        for (const [id, value] of Object.entries(counters)) {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'total-sales') {
                    element.textContent = new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                    }).format(value);
                } else {
                    element.textContent = value.toLocaleString('tr-TR');
                }
            }
        }
    }

    startAutoRefresh() {
        // Her 5 dakikada bir otomatik yenileme
        setInterval(() => this.refreshStats(), 5 * 60 * 1000);
    }
}

// Dashboard'ı başlat
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
});
