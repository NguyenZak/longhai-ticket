<?php

namespace App\Queries;

class GetUserBookingsQuery
{
    public function __construct(
        public string $userId,
        public ?string $status = null,
        public ?string $fromDate = null,
        public ?string $toDate = null,
        public int $limit = 20,
        public int $offset = 0
    ) {}
}
