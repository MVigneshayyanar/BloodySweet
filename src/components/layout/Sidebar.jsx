import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    UsersIcon,
    ChartBarIcon,
    ArrowLeftOnRectangleIcon,
    XMarkIcon,
    HeartIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const location = useLocation();
    const { logout, currentUser } = useAuth();

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: HomeIcon, current: location.pathname === '/dashboard' },
        { name: 'Donors', href: '/dashboard/donors', icon: UsersIcon, current: location.pathname === '/dashboard/donors' },
        { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, current: location.pathname === '/dashboard/analytics' },
    ];

    // Add Blood Requests link for organizations
    if (currentUser && currentUser.role && ['hospital', 'blood_bank', 'ngo'].includes(currentUser.role)) {
        navigation.splice(1, 0, { name: 'Blood Requests', href: '/dashboard/requests', icon: HeartIcon, current: location.pathname === '/dashboard/requests' });
    }

    const NavContent = () => (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4 h-full">
            <div className="flex h-16 shrink-0 items-center">
                <h1 className="text-2xl font-bold text-red-600">Humanitarian</h1>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={classNames(
                                            item.current
                                                ? 'bg-rose-50 text-rose-600 border-r-4 border-rose-600'
                                                : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50',
                                            'group flex gap-x-3 p-3 text-sm leading-6 font-medium transition-all duration-200'
                                        )}
                                        onClick={() => setMobileOpen && setMobileOpen(false)}
                                    >
                                        <item.icon
                                            className={classNames(
                                                item.current ? 'text-rose-600' : 'text-slate-400 group-hover:text-rose-600',
                                                'h-6 w-6 shrink-0 transition-colors duration-200'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li className="mt-auto">
                        <button
                            onClick={() => logout()}
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-red-600 w-full text-left"
                        >
                            <ArrowLeftOnRectangleIcon
                                className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-600"
                                aria-hidden="true"
                            />
                            Log out
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <Transition.Root show={mobileOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={() => setMobileOpen(false)}>
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <NavContent />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Desktop Sidebar (hidden on mobile) */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-56 lg:flex-col">
                <NavContent />
            </div>
        </>
    );
}
