import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
  type UIEvent,
} from "react";
import type { UseFormSetValue } from "react-hook-form";
import {
  resolveLocationOptionByCode,
  type LocationOption,
} from "../../services/locations";
import type { FlightSearchQuery } from "../../types/flight";
import { IATA_REGEX, MIN_LOCATION_QUERY } from "./const";
import { useLocationSearch } from "./useLocationSearch";
import {
  buildFallbackOption,
  buildGroupLabelMap,
  getInitialLocationState,
  getSearchSeed,
  getVisibleOptions,
  isFallbackLocation,
} from "./utils";

type LocationFieldName = "origin" | "destination";

type UseLocationFieldParams = {
  field: LocationFieldName;
  query: FlightSearchQuery;
  setValue: UseFormSetValue<FlightSearchQuery>;
  onChange: (query: FlightSearchQuery) => void;
};

export const useLocationField = ({
  field,
  query,
  setValue,
  onChange,
}: UseLocationFieldParams) => {
  const {
    options,
    lastOptions,
    loading,
    loadingMore,
    error,
    loadMore,
    search,
    reset,
  } = useLocationSearch();
  const initialState = getInitialLocationState(query[field]);
  const [input, setInput] = useState(initialState.input);
  const [selected, setSelected] = useState<LocationOption | null>(
    initialState.selected,
  );
  const [focused, setFocused] = useState(false);
  const ignoreSync = useRef(false);
  const resolvedRef = useRef<string | null>(null);

  const setFieldValue = (value: string) => {
    setValue(field, value, { shouldValidate: true });
    onChange({ ...query, [field]: value });
  };

  const handleInputChange = (
    _event: SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    // Prevent the input from being cleared when the selection is reset
    if (reason === "reset" && value === "") {
      return;
    }

    setInput(value);

    if (reason === "input" || reason === "clear") {
      if (selected) {
        setSelected(null);
      }

      ignoreSync.current = true;
      setFieldValue("");

      if (reason === "clear") {
        reset();
      } else {
        search(value);
      }
    }
  };

  const handleChange = (
    _event: SyntheticEvent,
    value: LocationOption | null,
  ) => {
    setSelected(value);

    if (!value) {
      setInput("");
      setFieldValue("");
      return;
    }

    setInput(value.label);
    setFieldValue(value.iataCode);
  };

  const handleOpen = () => {
    const searchValue = getSearchSeed(selected, input);
    if (!options.length && searchValue.trim().length >= MIN_LOCATION_QUERY) {
      search(searchValue);
    }
  };

  const visibleOptions = getVisibleOptions(input, options, lastOptions);
  const groupLabels = useMemo(
    () => buildGroupLabelMap(visibleOptions),
    [visibleOptions],
  );
  const showDisplay = Boolean(selected) && !focused;

  const handleListboxScroll = useCallback(
    (event: UIEvent<HTMLElement>) => {
      const listbox = event.currentTarget;
      const remaining =
        listbox.scrollHeight - listbox.scrollTop - listbox.clientHeight;
      if (remaining < 48) {
        void loadMore();
      }
    },
    [loadMore],
  );

  // Sync local autocomplete state with URL-driven query changes.
  useEffect(() => {
    if (ignoreSync.current) {
      ignoreSync.current = false;
      return;
    }

    const trimmed = query[field].trim();
    if (!trimmed) {
      if (selected) setSelected(null);
      if (input) setInput("");
      return;
    }

    const upper = trimmed.toUpperCase();
    if (IATA_REGEX.test(upper)) {
      const matchedSelected =
        selected && selected.iataCode === upper ? selected : null;
      const next = matchedSelected ?? buildFallbackOption(upper);
      if (
        !selected ||
        selected.iataCode !== next.iataCode ||
        selected.label !== next.label
      ) {
        setSelected(next);
      }

      const desiredLabel = matchedSelected ? matchedSelected.label : next.label;
      if (input !== desiredLabel) setInput(desiredLabel);
      return;
    }

    if (selected) setSelected(null);

    if (input !== trimmed) setInput(trimmed);
  }, [field, input, query, selected]);

  useEffect(() => {
    const trimmed = query[field].trim();
    if (!trimmed) {
      resolvedRef.current = null;
      return;
    }

    const upper = trimmed.toUpperCase();
    if (!IATA_REGEX.test(upper)) {
      resolvedRef.current = null;
      return;
    }

    if (resolvedRef.current === upper) return;

    if (!isFallbackLocation(selected, upper)) {
      resolvedRef.current = upper;
      return;
    }

    let active = true;
    void (async () => {
      const resolved = await resolveLocationOptionByCode(upper);
      if (!active) return;
      if (resolved) {
        setSelected(resolved);
        setInput(resolved.label);
      }
      resolvedRef.current = upper;
    })();

    return () => {
      active = false;
    };
  }, [field, query, selected]);

  const suspendSyncOnce = () => {
    ignoreSync.current = true;
  };

  return {
    input,
    setInput,
    selected,
    setSelected,
    focused,
    setFocused,
    options,
    loading,
    loadingMore,
    error,
    visibleOptions,
    groupLabels,
    showDisplay,
    handleInputChange,
    handleChange,
    handleOpen,
    handleListboxScroll,
    suspendSyncOnce,
  };
};
