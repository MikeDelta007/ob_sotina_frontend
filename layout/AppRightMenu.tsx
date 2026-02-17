'use client';

import React, { useState, useContext } from 'react';

import { classNames } from 'primereact/utils';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { LayoutContext } from './context/layoutcontext';
import { Sidebar } from 'primereact/sidebar';

const AppRightMenu = () => {
    const { layoutState, setLayoutState, showRightSidebar } = useContext(LayoutContext);
    const amount = [
        {
            label: '*****24',
            value: { id: 1, name: '*****24', code: 'A1' }
        },
        {
            label: '*****75',
            value: { id: 2, name: '*****75', code: 'A2' }
        }
    ];

    const [selectedAmount, setSelectedAmount] = useState(amount[0].value);

    const sidebarClassName = classNames('layout-sidebar-right', {
        'layout-sidebar-right-active': layoutState.rightMenuVisible
    });

    return (
        <div className={sidebarClassName}>
            <Sidebar
                visible={layoutState.rightMenuVisible}
                position="right"
                baseZIndex={1000}
                showCloseIcon={false}
                style={{ width: '100%', maxWidth: '18rem' }}
                onHide={() =>
                    setLayoutState((prevLayoutState) => ({
                        ...prevLayoutState,
                        rightMenuVisible: false
                    }))
                }
            >
                <div className="p-2">
                    <h5>Activity</h5>
                    <div className="timeline mb-5">
                        <div className="pt-0 pr-3 pb-3 pl-3 border-left-1 surface-border relative ml-2">
                            <span className="absolute left-0 top-0 bg-blue-500 text-white border-circle w-2rem h-2rem inline-flex align-items-center justify-content-center" style={{ transform: 'translateX(-50%)' }}>
                                <i className="pi pi-dollar"></i>
                            </span>
                            <div className="font-semibold mb-2 ml-2">New Sale</div>
                            <div className="text-sm p-text-secondary ml-2">
                                Richard Jones has purchased a blue t-shirt for <strong>$79</strong>.
                            </div>
                        </div>
                        <div className="pt-0 pr-3 pb-3 pl-3 border-left-1 surface-border relative ml-2">
                            <span className="absolute left-0 top-0 bg-indigo-500 text-white border-circle w-2rem h-2rem inline-flex align-items-center justify-content-center" style={{ transform: 'translateX(-50%)' }}>
                                <i className="timeline-icon pi pi-download"></i>
                            </span>
                            <div className="font-semibold mb-2 ml-2">Withdrawal Initiated</div>
                            <div className="text-sm p-text-secondary ml-2">
                                Your request for withdrawal of <strong>$2500</strong> has been initiated.
                            </div>
                        </div>
                        <div className="pt-0 pr-3 pb-3 pl-3 border-left-1 surface-border relative ml-2">
                            <span className="absolute left-0 top-0 bg-purple-500 text-white border-circle w-2rem h-2rem inline-flex align-items-center justify-content-center" style={{ transform: 'translateX(-50%)' }}>
                                <i className="timeline-icon pi pi-question"></i>
                            </span>
                            <div className="font-semibold mb-2 ml-2">Question Received</div>
                            <div className="text-sm p-text-secondary ml-2">
                                Jane Davis has posted a <strong>new question</strong> about your product.
                            </div>
                        </div>
                        <div className="pt-0 pr-3 pb-3 pl-3 border-left-1 surface-border relative ml-2">
                            <span className="absolute left-0 top-0 bg-green-500 text-white border-circle w-2rem h-2rem inline-flex align-items-center justify-content-center" style={{ transform: 'translateX(-50%)' }}>
                                <i className="timeline-icon pi pi-comment"></i>
                            </span>

                            <span className="absolute left-0 top-0 bg-green-500 text-white border-circle w-2rem h-2rem inline-flex align-items-center justify-content-center" style={{ transform: 'translateX(-50%)' }}>
                                <i className="timeline-icon pi pi-comment"></i>
                            </span>
                            <div className="font-semibold mb-2 ml-2">Comment Received</div>
                            <div className="text-sm p-text-secondary ml-2">
                                Claire Smith has upvoted your store along with a <strong>comment</strong>.
                            </div>
                        </div>
                    </div>

                    <hr />

                    <h5>Quick Withdraw</h5>
                    <div className="p-fluid">
                        <InputText type="text" placeholder="Amount" className="mb-3" />
                        <Dropdown options={amount} value={selectedAmount} onChange={(e) => setSelectedAmount(e.value)} className="mb-3" />
                        <Button label="Confirm" icon="pi pi-check" className="p-2 mr-2 mt-2" />
                    </div>

                    <h5>Shipment Tracking</h5>
                    <p>Track your ongoing shipments to customers.</p>
                    <img className="logo-image w-full" src={`/demo/images/sidebar-right/staticmap.png`} alt="diamond-react" />
                </div>
            </Sidebar>
        </div>
    );
};

export default AppRightMenu;
