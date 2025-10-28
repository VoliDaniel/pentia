const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://azurecandidatetestapi.azurewebsites.net";

const API_KEY = process.env.API_KEY ?? "test1234";
const API_VERSION = process.env.API_VERSION ?? "v1.0";

if (!API_KEY) {
  throw new Error(
    "Missing API key. Set the API_KEY environment variable to access the sales API."
  );
}

type ApiListResponse<T> = {
  value: T[];
  Count?: number;
};

// Handle APIs returning either an array or an object with a `value` array.
function normalizeListResponse<T>(
  data: ApiListResponse<T> | T[] | null | undefined
): T[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.value)) {
    return data.value;
  }

  console.warn("Unexpected list response shape", data);
  return [];
}

export type SalesPerson = {
  id: number;
  name: string | null;
  hireDate: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
};

export type OrderLine = {
  id: number;
  orderName: string | null;
  orderPrice: number;
  orderDate: string | null;
  salesPersonId: number;
};

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ApiKey: API_KEY,
    },
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchSalesPeople(): Promise<SalesPerson[]> {
  const data = await fetchFromApi<
    ApiListResponse<SalesPerson> | SalesPerson[]
  >(
    `/api/${API_VERSION}/SalesPersons`
  );

  const salesPeople = normalizeListResponse(data);

  if (!salesPeople.length) {
    console.log("No salespeople data found.");
  }

  return salesPeople;
}

export async function fetchOrderLines(): Promise<OrderLine[]> {
  const data = await fetchFromApi<ApiListResponse<OrderLine> | OrderLine[]>(
    `/api/${API_VERSION}/Orderlines`
  );

  return normalizeListResponse(data);
}
