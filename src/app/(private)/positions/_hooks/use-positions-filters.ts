import {
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
    useQueryStates,
} from "nuqs";

import {
    POSITION_ROLES,
    type PositionRole,
} from "../_constants/constants";

export function usePositionsFilters() {
    const [filters, setFilters] = useQueryStates({
        id: parseAsInteger,
        page: parseAsInteger.withDefault(1),
        search: parseAsString.withDefault(""),
        role: parseAsStringEnum<PositionRole>([...POSITION_ROLES]),
    });

    function clearFilters() {
        void setFilters({
            page: null,
            search: null,
            role: null,
        })
    }

    return {
        filters,
        setFilters,
        clearFilters,
    };
}
