import { useState } from 'react';
import { FaAngleDown, FaAngleRight, FaMobileAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { Link } from 'react-router-dom';

const NavDrawer = ({ isDrawerOpen, toggleDrawer, categories, closeDrawer }) => {
    const [expandedCategories, setExpandedCategories] = useState([]);

    const toggleCategoryExpansion = (categoryId) => {
        if (expandedCategories.includes(categoryId)) {
            setExpandedCategories(expandedCategories.filter((id) => id !== categoryId));
        } else {
            setExpandedCategories([...expandedCategories, categoryId]);
        }
    };

    return (
        <Drawer
            open={isDrawerOpen}
            onClose={toggleDrawer}
            size={350}
            direction="left"
            className="!z-[1200] drawer h-screen overflow-y-auto relative"
        >
            <div className="p-4">
                <div className='flex justify-between items-center'>
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-main">Categories</h2>
                    </div>
                    <div>
                        <IoIosClose className='font-extrabold mb-2 text-main' size={40} onClick={closeDrawer} />
                    </div>
                </div>
                {categories.map((category) => (
                    <div key={category._id} className="mb-2">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleCategoryExpansion(category._id)}>
                            <Link to={`/category/${category.name}`} className="text-gray-700 text-[18px] no-underline font-bold capitalize">
                                {category.name}
                            </Link>
                            {category?.subcategories.length > 0 && (
                                expandedCategories.includes(category._id) ? (
                                    <FaAngleDown className="text-gray-500 font-bold" />
                                ) : (
                                    <FaAngleRight className="text-gray-500 font-extrabold" />
                                )
                            )}
                        </div>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.includes(category._id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            {category.subcategories.length > 0 && (
                                <div className="pl-4 mt-2 rounded">
                                    {category.subcategories.map((subcategory) => (
                                        <Link
                                            key={subcategory._id}
                                            to={`/category/${category.slug}/subcategory/${subcategory.slug}`}
                                            className="block capitalize mb-2 bg-main bg-opacity-10 border-main border-l-4 no-underline text-main py-1 pl-2 rounded"
                                        >
                                            {subcategory.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex ml-3 absolute bottom-3 w-full text-green-800 font-bold text-base items-center gap-1'>
                <FaMobileAlt className='text-orange-700 text-xl' size={26} />
                <a href='tel:03337494323' className='text-green-800 no-underline font-bold text-base'>
                    0333-7494323
                </a>
            </div>

        </Drawer>
    );
};

export default NavDrawer;