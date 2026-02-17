'use client';

import React, { useRef, useContext } from 'react';
import { CSSTransition } from 'react-transition-group';
import { InputText } from 'primereact/inputtext';
import { LayoutContext } from './context/layoutcontext';
import { Dialog } from 'primereact/dialog';

const AppSearch = () => {
    const { layoutState, setLayoutState, onSearchHide } = useContext(LayoutContext);
    const searchRef = useRef(null);
    let searchInputEl = null;
    const breakpoints = { '992px': '75vw', '576px': '90vw' };

    const onInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const key = event.which;

        //escape, tab and enter
        if (key === 27 || key === 9 || key === 13) {
            onSearchHide(event);
        }
    };

    const onEnter = () => {
        if (searchInputEl) {
            searchInputEl.focus();
        }
    };

    const focusOnInput = () => {
        const input = document.getElementById('searchInput');
        if (input) {
            input.focus();
        }
    };

    return (
        <div className="layout-search">
            <CSSTransition nodeRef={searchRef} classNames="search-container" timeout={{ enter: 400, exit: 400 }} in={layoutState.searchBarActive} unmountOnExit onEnter={onEnter}>
                <Dialog
                    visible={layoutState.searchBarActive}
                    style={{ width: '50vw' }}
                    breakpoints={breakpoints}
                    closeOnEscape={true}
                    closable={true}
                    dismissableMask={true}
                    draggable={false}
                    modal={true}
                    onShow={focusOnInput}
                    headerClassName="hidden"
                    contentClassName="p-0"
                    onHide={() =>
                        setLayoutState((prevLayoutState) => ({
                            ...prevLayoutState,
                            searchBarActive: false
                        }))
                    }
                >
                    <div className="search-container">
                        <i className="pi pi-search"></i>
                        <InputText id="searchInput" type="text" className="p-inputtext search-input" placeholder="Search" onKeyDown={onInputKeydown} />
                    </div>
                </Dialog>
            </CSSTransition>
        </div>
    );
};

export default AppSearch;
