import type { FC } from 'react';
import Pagination from '../Pagination/Pagination';

interface RecentActivityListPaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const RecentActivityListPagination: FC<RecentActivityListPaginationProps> = ({
  currentPage = 0,
  totalPages = 1,
  onPageChange,
}) => {
  if (!onPageChange) return null;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className="mt-3"
    />
  );
};

export default RecentActivityListPagination;
