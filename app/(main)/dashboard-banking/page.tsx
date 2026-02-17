'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { Ripple } from 'primereact/ripple';
import { ChartData, ChartOptions } from 'chart.js';

const Banking = () => {
    const [barOptions, setBarOptions] = useState({});
    const [barData, setBarData] = useState({});
    const { layoutConfig } = useContext(LayoutContext);

    const [hoveredIndex, setHoveredIndex] = useState(-1);

    const menu = useRef(null);
    const handleMouseEnter = (index: number) => {
        setHoveredIndex(index);
    };
    const showMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (menu.current) {
            menu.current.show(event);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(-1);
    };

    const items = [
        {
            label: 'View Details'
        },
        {
            label: 'Print Receipt'
        },
        {
            label: 'Hide'
        }
    ];

    const transactions = [
        {
            title: 'Apple iCloud Subscription',
            date: '12 Aug, 19:18',
            badge: 'Entertainment',
            received: false,
            amount: '-$25.00',
            icon: 'pi pi-apple'
        },
        {
            title: 'Car Insurance',
            date: '11 Aug, 15:50',
            badge: 'Personal',
            received: false,
            amount: '-$350.00',
            icon: 'pi pi-car'
        },
        {
            title: 'Money Transfer',
            date: '11 Aug, 07:02',
            badge: 'Transfer',
            received: true,
            amount: '+$900.00',
            icon: 'pi pi-money-bill'
        },
        {
            title: 'Credit Card Payment',
            date: '9 Aug, 21:33',
            badge: 'Personal',
            received: false,
            amount: '-$3558.70',
            icon: 'pi pi-credit-card'
        },
        {
            title: 'Divident Payment',
            date: '8 Aug, 17:51',
            badge: 'Investment',
            received: true,
            amount: '+$105.90',
            icon: 'pi pi-microsoft'
        }
    ];

    const expenses = [
        {
            image: 'banking-4',
            title: 'Food',
            value: '79',
            amount: '$702.00',
            background: 'linear-gradient(-120deg, rgba(77, 182, 172, 1), rgba(77, 182, 172, 0.3) 70%)'
        },
        {
            image: 'banking-5',
            title: 'Electronics',
            value: '62',
            amount: '$421.60',
            background: 'linear-gradient(-120deg, rgba(77, 182, 172, 1), rgba(77, 182, 172, 0.3) 70%)'
        },
        {
            image: 'banking-6',
            title: 'Utilities',
            value: '45',
            amount: '$388.51',
            background: 'linear-gradient(-120deg, rgba(250, 183, 16, 1), rgba(250, 183, 16, 0.3) 70%)'
        },
        {
            image: 'banking-7',
            title: 'Clothing',
            value: '41',
            amount: '$295.72',
            background: 'linear-gradient(-120deg, rgba(250, 183, 16, 1), rgba(250, 183, 16, 0.3) 70%)'
        },
        {
            image: 'banking-8',
            title: 'Travel',
            value: '35',
            amount: '$170.05',
            background: 'linear-gradient(-120deg, rgba(198, 55, 55, 1), rgba(198, 55, 55, 0.3) 70%)'
        },
        {
            image: 'banking-9',
            title: 'Subscriptions',
            value: '23',
            amount: '$96.80',
            background: 'linear-gradient(-120deg, rgba(198, 55, 55, 1), rgba(198, 55, 55, 0.3) 70%)'
        }
    ];

    const metrics = [
        {
            title: 'Main Account',
            profit: '+8%',
            description: 'vs last week',
            image: 'banking-1'
        },
        {
            title: 'Investment Account',
            profit: '+8%',
            description: 'vs last week',
            image: 'banking-2'
        },
        {
            title: 'Expenses Account',
            profit: '+8%',
            description: 'vs last week',
            image: 'banking-3'
        }
    ];

    const initChart = () => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dee2e6';

        const barData: ChartData = {
            labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'],
            datasets: [
                {
                    label: 'Revenue',
                    backgroundColor: documentStyle.getPropertyValue('--primary-500') || '#2196f3',
                    barThickness: 12,
                    borderRadius: 12,
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    label: 'Expenses',
                    backgroundColor: '#FAB918',
                    barThickness: 12,
                    borderRadius: 12,
                    data: [35, 19, 40, 61, 16, 55, 30]
                }
            ]
        };

        const barOptions: ChartOptions = {
            animation: {
                duration: 0
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        font: {
                            weight: '700'
                        },
                        padding: 28
                    },
                    position: 'top'
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: '500'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        callback(value) {
                            return '$' + value + 'k';
                        },
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };

        setBarData(barData);
        setBarOptions(barOptions);
    };

    useEffect(() => {
        initChart();
    }, [layoutConfig]);

    return (
        <div className="layout-dashboard">
            <div className="grid">
                <div className="col-12 flex align-items-center justify-content-between flex-wrap gap-5">
                    <div className="mx-auto sm:mx-0">
                        <span className="block text-xl font-semibold mb-2">Total Balance</span>
                        <div className="flex align-items-center">
                            <span className="font-semibold text-2xl">
                                $57,401
                                <span className="text-color-secondary text-base">.26</span>
                            </span>
                            <span className="text-green-700 border-round font-semibold ml-4 p-2 white-space-nowrap" style={{ backgroundColor: 'rgba(77, 182, 172, 0.1)' }}>
                                +$401 Today
                            </span>
                        </div>
                    </div>
                    <div className="mx-auto sm:mx-0">
                        <Button icon="pi pi-calendar" rounded severity="secondary" outlined className="mr-1 sm:mr-3" />

                        <Button icon="pi pi-plus" iconPos="right" label="Add Quick Action" severity="secondary" rounded />
                    </div>
                </div>

                {metrics.map((metric, index) => (
                    <div key={metric.title} className="col-12 md:col-4">
                        <div className="card flex w-full relative h-14rem overflow-hidden" onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave}>
                            <div className="flex w-full justify-content-between p-1">
                                <div>
                                    <span className="block white-space-nowrap font-semibold">{metric.title}</span>
                                    <span className="block font-semibold text-xl mt-2 white-space-nowrap">
                                        $12,345
                                        <span className="text-color-secondary text-sm">.67</span>
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block white-space-nowrap">
                                        {metric.profit}
                                        <i className="pi pi-arrow-up text-green-500"></i>
                                    </span>
                                    <span className="block text-color-secondary mt-2 white-space-nowrap">vs last week</span>
                                </div>
                            </div>
                            <img src={`/demo/images/dashboard/${metric.image}.svg`} className="absolute w-full bottom-0 left-0" alt="metric.image" />
                            {hoveredIndex === index && (
                                <Button label="View Details" icon="pi pi-eye" iconPos="right" rounded severity="secondary" className="p-ripple fadeindown font-semibold absolute" style={{ borderRadius: '50px', left: '36%', bottom: '10%' }} />
                            )}
                        </div>
                    </div>
                ))}

                <div className="h-full col-12 xl:col-8">
                    <div className="card">
                        <div className="flex flex-column md:flex-row md:justify-content-between align-items-center mb-2">
                            <h4 className="white-space-nowrap">Recent Transactions</h4>
                            <Button label="See All Transactions" text />
                            <Ripple />
                        </div>

                        <DataTable headerColumnGroup="none" value={transactions} rows={5} responsiveLayout="scroll">
                            <Column
                                body={(transaction) => (
                                    <span className="white-space-nowrap flex w-3rem h-3rem align-items-center justify-content-center border-round-xl" style={{ backgroundColor: 'rgba(77, 182, 172, 0.1)' }}>
                                        <i className={`text-2xl text-color ${transaction.icon}`}></i>
                                    </span>
                                )}
                            />
                            <Column
                                body={(transaction) => (
                                    <>
                                        <span className="white-space-nowrap block font-semibold">{transaction.title}</span>
                                        <span className="block text-color-secondary font-sm font-bold">{transaction.date}</span>
                                    </>
                                )}
                            />
                            <Column body={(transaction) => <span className="white-space-nowrap p-2 surface-ground font-semibold">{transaction.badge}</span>} />
                            <Column body={(transaction) => <span className={`white-space-nowrap block font-semibold text-lg text-right ${transaction.received ? 'text-green-700' : ''}`}>{transaction.amount}</span>} />
                            <Column
                                body={() => (
                                    <>
                                        <Button text severity="secondary" onClick={showMenu}>
                                            <i className="pi pi-ellipsis-v"></i>
                                        </Button>
                                        <Menu ref={menu} model={items} popup={true}></Menu>
                                    </>
                                )}
                            />
                        </DataTable>
                    </div>
                </div>

                <div className="h-full col-12 xl:col-4">
                    <Card className="h-full">
                        <h4 className="white-space-nowrap mb-2">Expenses</h4>
                        {expenses.map((expense) => (
                            <div key={expense.title} className="flex gap-3 w-full mt-4 align-items-center">
                                <img src={`/demo/images/dashboard/${expense.image}.svg`} alt={expense.title} className="w-3rem h-3rem" />
                                <div className="w-full">
                                    <div className="flex flex-wrap w-full justify-content-between align-items-center">
                                        <span className="font-semibold">{expense.title}</span>
                                        <div className="flex">
                                            <span className="font-semibold text-color-secondary pr-2 border-right-2 surface-border text-sm">{expense.value}%</span>
                                            <span className="font-semibold ml-2 text-sm">{expense.amount}</span>
                                        </div>
                                    </div>
                                    <div
                                        className="border-round w-full overflow-hidden mt-2"
                                        style={{
                                            height: '7px',
                                            backgroundColor: 'var(--surface-border)'
                                        }}
                                    >
                                        <div
                                            className="border-left-round h-full"
                                            style={{
                                                background: expense.background,
                                                width: expense.value + '%'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>

                <div className="col-12 xl:col-6">
                    <div className="card h-full">
                        <div className="flex align-items-center">
                            <h4 className="white-space-nowrap mr-3 mb-0">Cards</h4>
                            <span className="w-2rem h-2rem flex justify-content-center align-items-center border-circle text-green-700 font-semibold" style={{ backgroundColor: 'rgba(77, 182, 172, 0.1)' }}>
                                2
                            </span>
                        </div>

                        <div className="grid flex-column sm:flex-row grid-nogutter border-round-xl mt-4">
                            <div className="col-12 sm:col-6 p-4 border-round-top-xl sm:border-noround-right sm:border-round-left-xl justify-content-between" style={{ backgroundColor: 'rgba(77, 182, 172, 0.1)' }}>
                                <span className="block text-xl font-semibold">Total Credit</span>
                                <span className="block text-3xl font-semibold mt-3">
                                    $12,345
                                    <span className="text-xl font-semibold" style={{ color: 'rgba(77, 182, 172, 0.7)' }}>
                                        .67
                                    </span>
                                </span>
                            </div>
                            <div className="col-12 sm:col-6 p-4 border-round-bottom-xl sm:border-noround-left sm:border-round-right-xl flex align-items-center justify-content-center sm:justify-content-end" style={{ backgroundColor: '#4DB6AC' }}>
                                <Button label="View Details" icon="pi pi-eye font-semibold" iconPos="right" rounded severity="success" text className="p-ripple surface-section font-semibold" style={{ color: '#4DB6AC' }} />
                            </div>
                        </div>

                        <div className="grid grid-nogutter flex-column md:flex-row mt-4 gap-4">
                            <div className="col">
                                <div
                                    className="card flex flex-column justify-content-between h-17rem bg-no-repeat bg-cover border-round-2xl shadow-none relative p-4 overflow-hidden"
                                    style={{
                                        backgroundImage: "url('/demo/images/dashboard/card-1.svg')"
                                    }}
                                >
                                    <div className="flex w-full align-items-center">
                                        <img src={`/demo/images/dashboard/mastercard.svg`} alt="mastercard" className="w-4rem mr-2" />
                                        <span className="text-2xl font-semibold white-space-nowrap">Personal Card</span>
                                        <img src={`/demo/images/dashboard/chip.svg`} alt="mastercard" className="w-3rem ml-auto" />
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="font-semibold white-space-nowrap">1234 1234 1234 1234</span>
                                        <span className="font-semibold">
                                            <span className="font-normal">Exp </span>12/23
                                        </span>
                                    </div>
                                    <div className="flex justify-content-between align-items-center mb-6">
                                        <span className="font-semibold">Limit</span>
                                        <div>
                                            <span className="font-bold px-2 border-right-2" style={{ color: '#4DB6AC', borderColor: '#4DB6AC' }}>
                                                100%
                                            </span>
                                            <span className="font-bold ml-2"> $300.00 / $123.00</span>
                                        </div>
                                    </div>

                                    <span
                                        className="h-3rem w-8 absolute bottom-0 left-0"
                                        style={{
                                            borderBottomLeftRadius: '1rem',
                                            backgroundColor: 'rgba(77, 182, 172, 1)'
                                        }}
                                    ></span>
                                    <span
                                        className="h-3rem w-4 absolute bottom-0 left-0"
                                        style={{
                                            borderBottomRightRadius: '1rem',
                                            backgroundColor: 'rgba(77, 182, 172, 0.3)'
                                        }}
                                    ></span>
                                </div>
                            </div>

                            <div className="col">
                                <div
                                    className="card flex flex-column justify-content-between h-17rem bg-no-repeat bg-cover border-round-2xl shadow-none relative p-4 overflow-hidden"
                                    style={{
                                        backgroundImage: "url('/demo/images/dashboard/card-2.svg')"
                                    }}
                                >
                                    <div className="flex w-full align-items-center">
                                        <img src={`/demo/images/dashboard/mastercard.svg`} alt="mastercard" className="w-4rem mr-2" />
                                        <span className="text-2xl font-semibold white-space-nowrap">Business Card</span>
                                        <img src={`/demo/images/dashboard/chip.svg`} alt="mastercard" className="w-3rem ml-auto" />
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="font-semibold white-space-nowrap">1234 1234 1234 1234</span>
                                        <span className="font-semibold">
                                            <span className="font-normal">Exp </span>12/23
                                        </span>
                                    </div>
                                    <div className="flex justify-content-between align-items-center mb-6">
                                        <span className="font-semibold">Limit</span>
                                        <div>
                                            <span className="font-bold px-2 border-right-2" style={{ color: '#4DB6AC', borderColor: '#4DB6AC' }}>
                                                100%
                                            </span>
                                            <span className="font-bold ml-2"> $300.00 / $123.00</span>
                                        </div>
                                    </div>
                                    <span
                                        className="h-3rem w-4 absolute bottom-0 left-0"
                                        style={{
                                            borderBottomLeftRadius: '1rem',
                                            backgroundColor: '#FAB710'
                                        }}
                                    ></span>
                                    <span
                                        className="h-3rem w-8 absolute bottom-0 right-0"
                                        style={{
                                            borderBottomRightRadius: '1rem',
                                            backgroundColor: 'rgba(250, 183, 16, 0.3)'
                                        }}
                                    ></span>
                                </div>
                            </div>
                        </div>
                        <a className="p-ripple w-full border-1 border-dashed surface-border h-4rem border-round-xl mt-4 flex justify-content-center align-items-center cursor-pointer select-none">
                            <i className="pi pi-plus-circle text-xl mr-2 text-color-secondary"></i>
                            <span className="text-xl text-color-secondary">Add New Card</span>
                            <Ripple />
                        </a>
                    </div>
                </div>
                <div className="col-12 xl:col-6">
                    <div className="card">
                        <h4>Savings</h4>
                        <Chart type="bar" data={barData} options={barOptions} height="470"></Chart>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banking;
