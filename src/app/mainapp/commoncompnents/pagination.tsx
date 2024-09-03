import { FC } from 'react';
import classnames from 'classnames';

interface PaginationProps {
    total: number;
    current: number;
    onChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ total, current, onChange }) => {
    const getPageNumbers = () => {
        const pageNumbers = [];

        // Display the first page number
        pageNumbers.push(1);

        // Display the ellipsis (...) if the current page is more than 3 pages away from the start
        if (current > 4) {
            pageNumbers.push('...');
        }

        // Display the current page and the 2 pages before and after it
        const startPage = Math.max(2, current - 2);
        const endPage = Math.min(total - 1, current + 2);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // Display the ellipsis (...) if the current page is more than 3 pages away from the end
        if (current < total - 3) {
            pageNumbers.push('...');
        }

        // Display the last page number
        if (total > 1) {
            pageNumbers.push(total);
        }

        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center gap-1 md:gap-2 text-sm">
            <button
                disabled={current === 1}
                onClick={() => onChange(current - 1)}
                className="p-2 rounded focus:outline-none focus:ring"
            >
                {'<'}
            </button>

            {pageNumbers.map((pageNum, index) => (
                <button
                    key={index}
                    onClick={() => onChange(pageNum === '...' ? current : pageNum)}
                    className={classnames(
                        'px-3 py-2 rounded focus:outline-none focus:ring',
                        { 'bg-[#174894] text-white': current === pageNum },
                        { 'hover:bg-blue-100': current !== pageNum && pageNum !== '...' }
                    )}
                    disabled={pageNum === '...'}
                >
                    {pageNum}
                </button>
            ))}

            <button
                disabled={current === total}
                onClick={() => onChange(current + 1)}
                className="p-2 rounded focus:outline-none focus:ring"
            >
                {'>'}
            </button>
        </div>
    );
};

export default Pagination;