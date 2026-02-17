'use client';

import React, { useRef, useState } from 'react';
import { Ripple } from 'primereact/ripple';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { StyleClass } from 'primereact/styleclass';
import { classNames } from 'primereact/utils';
import { Page } from '@/types/layout';

const LandingPage: Page = () => {
    const [isHidden, setIsHidden] = useState(false);
    const menuRef = useRef(null);

    const toggleMenuItemClick = () => {
        setIsHidden((prevState) => !prevState);
    };

    return (
        <div className="relative overflow-hidden flex flex-column justify-content-center">
            <div className="absolute top-0 bg-shape-top bg-no-repeat bg-cover w-full"></div>
            <div id="home" className="pages-wrapper z-1">
                <div className="px-4 md:px-8 flex align-items-center justify-content-between relative lg:static" style={{ minHeight: '80px' }}>
                    <div className="flex gap-2 align-items-center text-white mr-0 lg:mr-6 select-none">
                        <img src={`/layout/images/logo-white.svg`} className="w-2rem h-2rem" alt="Diamond Logo" />
                        <span className="font-bold text-3xl">DIAMOND</span>
                    </div>

                    <StyleClass nodeRef={menuRef} selector="@next" enterActiveClassName="px-fadein" enterClassName="hidden" leaveToClassName="hidden" hideOnOutsideClick>
                        <a ref={menuRef} href="#home" className="cursor-pointer lg:hidden flex text-white">
                            <i className="pi pi-bars text-4xl"></i>
                        </a>
                    </StyleClass>

                    <div id="menu" className={classNames('align-items-center flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full left-0 top-100 z-1 shadow-2 lg:shadow-none md:bg-transparent', { hidden: isHidden })}>
                        <ul className="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
                            <li>
                                <a
                                    onClick={toggleMenuItemClick}
                                    href="#home"
                                    className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 lg:text-white text-lg white-space-nowrap"
                                >
                                    <span>HOME</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li className="lg:relative">
                                <a
                                    href="#features"
                                    onClick={toggleMenuItemClick}
                                    className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 lg:text-white text-lg white-space-nowrap"
                                >
                                    <span>MEET DIAMOND</span>
                                    <Ripple />
                                </a>
                            </li>

                            <li>
                                <a
                                    onClick={toggleMenuItemClick}
                                    href="#theming"
                                    className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 lg:text-white text-lg white-space-nowrap"
                                >
                                    <span>THEMING</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li>
                                <a
                                    onClick={toggleMenuItemClick}
                                    href="#pricing"
                                    className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 lg:text-white text-lg white-space-nowrap"
                                >
                                    <span>PRICING</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li>
                                <a
                                    onClick={toggleMenuItemClick}
                                    href="#pricing"
                                    className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 lg:text-white text-lg white-space-nowrap"
                                >
                                    <span>BUY NOW</span>
                                    <Ripple />
                                </a>
                            </li>
                        </ul>
                        <ul className="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row border-top-1 surface-border lg:border-top-none">
                            <li>
                                <a
                                    href="#contact"
                                    onClick={toggleMenuItemClick}
                                    className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 lg:text-white text-lg white-space-nowrap"
                                >
                                    <span>CONTACT</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li>
                                <a className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 lg:text-white text-lg white-space-nowrap">
                                    <i className="pi pi-github text-2xl lg:text-xl mr-2 lg:mr-0"></i>
                                    <span className="lg:hidden">Github</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li>
                                <a className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 lg:text-white text-lg white-space-nowrap">
                                    <i className="pi pi-twitter text-2xl lg:text-xl mr-2 lg:mr-0"></i>
                                    <span className="lg:hidden">Twitter</span>
                                    <Ripple />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="px-4 md:px-8 z-2">
                    <div className="grid justify-content-between mb-6 md:mb-8 mt-5">
                        <div className="col-12 lg:col-6 text-center lg:text-left flex flex-column gap-3">
                            <span className="font-bold text-4xl text-white text-center md:text-left w-full md:w-9">PrimeTek Proudly Presents Theme Diamond</span>
                            <p className="w-full md:w-9 text-center md:text-left font-semibold text-white">Modern and elegant responsive application template with a premium look for PrimeReact components.</p>
                            <a
                                role="button"
                                className="p-ripple p-button px-6 py-2 w-15rem flex align-self-center md:align-self-start justify-content-center align-items-center surface-section font-bold cursor-pointer border-none hover:bg-primary-100 shadow-3 md:shadow-none"
                                style={{ color: 'var(--primary-800)' }}
                            >
                                LEARN MORE
                                <Ripple />
                            </a>
                        </div>
                        <div className="col-12 text-center md:text-right lg:col-6">
                            <img src={`/layout/images/pages/landing/header-image.png`} className="w-full sm:w-auto animation-duration-200 fadeinright" alt="Diamond Dashboard" />
                        </div>
                    </div>

                    <div id="features" className="my-6 md:my-8 py-4">
                        <div className="w-full text-center">
                            <span className="block font-bold text-5xl mb-2">Meet Diamond</span>
                            <span className="block font-bold text-lg text-color-secondary">Full Customizable Template</span>
                        </div>
                        <div className="grid mt-8">
                            <div className="col-12 md:col-6 lg:col-3 text-center px-5">
                                <img src={`/layout/images/pages/landing/icon-devices.svg`} alt="Devices" className="w-3rem h-3rem mb-4 animation-duration-200 fadeinleft" />
                                <span className="text-2xl font-bold block">Responsive</span>
                                <span className="font-bold block mt-3 text-color-secondary">Nam non ligula sed urna malesuada lacinia. Aliquam sed viverra ipsum.</span>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 text-center px-5">
                                <img src={`/layout/images/pages/landing/icon-design.svg`} alt="Devices" className="w-3rem h-3rem mb-4 animation-duration-200 fadeindown" />
                                <span className="text-2xl font-bold block">Modern Design</span>
                                <span className="font-bold block mt-3 text-color-secondary">Nam non ligula sed urna malesuada lacinia. Aliquam sed viverra ipsum.</span>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 text-center px-5">
                                <img src={`/layout/images/pages/landing/icon-document.svg`} alt="Devices" className="w-3rem h-3rem mb-4 animation-duration-200 fadeindown" />
                                <span className="text-2xl font-bold block">Well Documented</span>
                                <span className="font-bold block mt-3 text-color-secondary">Nam non ligula sed urna malesuada lacinia. Aliquam sed viverra ipsum.</span>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 text-center px-5">
                                <img src={`/layout/images/pages/landing/icon-diamond.svg`} alt="Devices" className="w-3rem h-3rem mb-4 animation-duration-200 fadeinright" />
                                <span className="text-2xl font-bold block">Premium Support</span>
                                <span className="font-bold block mt-3 text-color-secondary">Nam non ligula sed urna malesuada lacinia. Aliquam sed viverra ipsum.</span>
                            </div>
                        </div>
                    </div>

                    <div id="theming" className="grid row-gap-8 my-6 md:my-8 py-4 justify-content-between align-items-center">
                        <div className="col-12 md:col-5 flex-order-0">
                            <div className="w-5rem bg-primary mb-2 border-round" style={{ height: '4px' }}></div>
                            <span className="text-2xl font-bold block mb-4">Cras suscipit mauris nisl. Donec molestie maximus tellus</span>
                            <span className="block font-semibold">
                                Cras suscipit mauris nisl. Donec molestie maximus tellus, eu congue elit interdum vitae. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean finibus laoreet lorem, non
                                pretium elit. Nunc vel commodo velit, eu venenatis dolor.
                            </span>
                        </div>
                        <div className="col-12 md:col-6 flex-order-1">
                            <img src={`/layout/images/pages/landing/feature-image-1.png`} className="w-full animation-duration-200 fadeinright" alt="Theming" />
                        </div>

                        <div className="col-12 md:col-6 flex-order-3 md:flex-order-2">
                            <img src={`/layout/images/pages/landing/feature-image-2.png`} className="w-full animation-duration-200 fadeinleft" alt="Theming" />
                        </div>
                        <div className="col-12 md:col-5 text-right h-full flex-order-2 md:flex-order-3">
                            <div className="w-5rem bg-primary mb-2 border-round ml-auto" style={{ height: '4px' }}></div>
                            <span className="text-2xl font-bold block mb-4">Cras suscipit mauris nisl. Donec molestie maximus tellus</span>
                            <span className="block font-semibold">
                                Cras suscipit mauris nisl. Donec molestie maximus tellus, eu congue elit interdum vitae. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean finibus laoreet lorem, non
                                pretium elit. Nunc vel commodo velit, eu venenatis dolor.
                            </span>
                        </div>

                        <div className="col-12 md:col-5 flex-order-4">
                            <div className="w-5rem bg-primary mb-2 border-round" style={{ height: '4px' }}></div>
                            <span className="text-2xl font-bold block mb-4">Cras suscipit mauris nisl. Donec molestie maximus tellus</span>
                            <span className="block font-semibold">
                                Cras suscipit mauris nisl. Donec molestie maximus tellus, eu congue elit interdum vitae. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean finibus laoreet lorem, non
                                pretium elit. Nunc vel commodo velit, eu venenatis dolor.
                            </span>
                        </div>
                        <div className="col-12 md:col-6 flex-order-5">
                            <img src={`/layout/images/pages/landing/feature-image-3.png`} className="w-full animation-duration-200 fadeinright" alt="Theming" />
                        </div>
                    </div>

                    <div id="pricing" className="my-6 md:my-8 py-4 text-center">
                        <span className="block font-bold text-5xl mb-3">Our Pricing</span>
                        <span className="block font-bold text-color-secondary text-xl">The best price for our customers</span>

                        <div className="grid justify-content-center lg:justify-content-between xl:justify-content-center mt-7">
                            <div className="col-12 md:col-6 lg:col-4 xl:col-3 lg:p-3 xl:p-5 flex-shrink-0">
                                <div className="card py-5 shadow-6 bg-blue-500 text-white">
                                    <span className="block text-2xl font-bold mb-3">BASIC</span>
                                    <span className="block text-xl font-semibold mb-3">Starting from</span>
                                    <span className="block text-xl font-bold">$5</span>
                                    <ul className="list-none mx-0 mt-3 p-0">
                                        <li className="font-semibold">Responsive Layout</li>
                                        <li className="mt-3 font-semibold">Unlimited Push Messages</li>
                                        <li className="mt-3 font-semibold">50 Support Ticket</li>
                                        <li className="mt-3 font-semibold">Free Shipping</li>
                                        <li className="mt-3 font-semibold">10GB Storage</li>
                                    </ul>

                                    <a className="p-button w-10 font-bold bg-blue-600 text-white mt-4 flex justify-content-center mx-auto select-none border-none hover:bg-blue-400">
                                        BUY NOW
                                        <Ripple />
                                    </a>
                                </div>
                            </div>

                            <div className="col-12 md:col-6 lg:col-4 xl:col-3 lg:p-3 xl:p-5 flex-shrink-0">
                                <div
                                    className="card py-5 shadow-6 text-white"
                                    style={{
                                        backgroundImage: 'linear-gradient(45deg, var(--blue-700) 0%, var(--blue-500) 100%)'
                                    }}
                                >
                                    <span className="block text-2xl font-bold mb-3">ELITE</span>
                                    <span className="block text-xl font-semibold mb-3">Starting from</span>
                                    <span className="block text-xl font-bold">$9</span>
                                    <ul className="list-none mx-0 mt-3 p-0">
                                        <li className="font-semibold">Responsive Layout</li>
                                        <li className="mt-3 font-semibold">Unlimited Push Messages</li>
                                        <li className="mt-3 font-semibold">50 Support Ticket</li>
                                        <li className="mt-3 font-semibold">Free Shipping</li>
                                        <li className="mt-3 font-semibold">10GB Storage</li>
                                    </ul>

                                    <a className="p-button w-10 font-bold bg-blue-600 text-white mt-4 flex justify-content-center mx-auto select-none border-none hover:bg-blue-700">
                                        BUY NOW
                                        <Ripple />
                                    </a>
                                </div>
                            </div>

                            <div className="col-12 md:col-6 lg:col-4 xl:col-3 lg:p-3 xl:p-5 flex-shrink-0">
                                <div className="card py-5 shadow-6 bg-blue-500 text-white">
                                    <span className="block text-2xl font-bold mb-3">PRO</span>
                                    <span className="block text-xl font-semibold mb-3">Starting from</span>
                                    <span className="block text-xl font-bold">$19</span>
                                    <ul className="list-none mx-0 mt-3 p-0">
                                        <li className="font-semibold">Responsive Layout</li>
                                        <li className="mt-3 font-semibold">Unlimited Push Messages</li>
                                        <li className="mt-3 font-semibold">50 Support Ticket</li>
                                        <li className="mt-3 font-semibold">Free Shipping</li>
                                        <li className="mt-3 font-semibold">10GB Storage</li>
                                    </ul>

                                    <a className="p-button w-10 font-bold bg-blue-600 text-white mt-4 flex justify-content-center mx-auto select-none border-none hover:bg-blue-400">
                                        BUY NOW
                                        <Ripple />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="contact" className="grid justify-content-center lg:justify-content-evenly mt-6 md:mt-8 pt-4">
                        <div className="col-12 text-center mb-5 text-white">
                            <span className="block text-5xl font-bold mb-3">Let&lsquo;s Get In Touch</span>
                            <span className="block text-xl font-bold">Just drop us an email</span>
                        </div>

                        <div className="col-12 sm:col-7 lg:col-4 lg:px-5">
                            <div className="card py-5 flex flex-column gap-4 shadow-4">
                                <span className="block font-bold text-lg">Say hi to the team</span>

                                <InputText placeholder="Full Name" />
                                <InputText placeholder="Email Address" />
                                <InputTextarea rows={7} placeholder="Your Message"></InputTextarea>

                                <a className="p-ripple p-button w-full font-bold bg-blue-600 text-white mt-2 flex justify-content-center mx-auto select-none border-none hover:bg-blue-400">
                                    SEND A MESSAGE
                                    <Ripple />
                                </a>
                            </div>
                        </div>
                        <div className="hidden lg:block lg:col-4 text-white">
                            <span className="block lg:text-5xl xl:text-6xl font-bold white-space-nowrap">
                                Feel free to contact us
                                <br />
                                and we will get
                                <br />
                                back to you
                                <br />
                                as soon as we can.
                            </span>
                            <div className="grid mt-6">
                                <div className="col-6">
                                    <span className="text-2xl font-bold">Opening Hours</span>
                                    <ul className="list-none mx-0 p-0 mt-3">
                                        <li className="font-semibold">Monday - Friday</li>
                                        <li className="font-semibold">9am - 6pm</li>
                                        <li className="font-semibold">Weekend</li>
                                        <li className="font-semibold">Closed</li>
                                    </ul>
                                </div>
                                <div className="col-6">
                                    <span className="text-2xl font-bold block">Address</span>
                                    <span className="font-semibold white-space-nowrap block mt-3">
                                        Cras suscipit mauris nisl.
                                        <br />
                                        Donec molestie
                                        <br />
                                        maximus tellus
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex align-items-center justify-content-between px-4 md:px-8 py-4 mt-5">
                    <div className="flex gap-2 align-items-center text-white select-none">
                        <img src={`/layout/images/logo-white.svg`} className="w-2rem h-2rem" alt="Diamond Logo" />
                        <span className="font-bold text-3xl">DIAMOND</span>
                    </div>
                    <div className="flex">
                        <i className="pi pi-github text-xl px-6 p-3 lg:px-3 lg:py-2 align-items-center text-white hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150"></i>
                        <i className="pi pi-twitter text-xl px-6 p-3 lg:px-3 lg:py-2 align-items-center text-white hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150"></i>
                    </div>
                </div>

                <div className="absolute bottom-0 bg-shape-bottom bg-no-repeat bg-cover w-full"></div>
            </div>
        </div>
    );
};

export default LandingPage;
