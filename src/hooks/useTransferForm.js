export function useTransferData() {
  const fetchData = async (setProducts, setWarehouses, setStock, setError, setLoading) => {
    try {
      setError(null);
      setLoading(true);

      const responses = await Promise.all([
        fetch('/api/products'),
        fetch('/api/warehouses'),
        fetch('/api/stock')
      ]);

      responses.forEach((response, index) => {
        if (!response.ok) {
          const endpoints = ['products', 'warehouses', 'stock'];
          throw new Error(`Failed to load ${endpoints[index]}: ${response.status} ${response.statusText}`);
        }
      });

      const [productsData, warehousesData, stockData] = await Promise.all(
        responses.map(res => res.json())
      );

      setProducts(productsData || []);
      setWarehouses(warehousesData || []);
      setStock(stockData || []);
    } catch (err) {
      console.error('Data fetch error:', err);
      const errorMessage = err.message || 'Failed to load transfer form data. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStock = (formData, stock) => {
    if (!formData.productId || !formData.fromWarehouseId || !stock.length) return 0;
    
    const stockRecord = stock.find(s => 
      s.productId === parseInt(formData.productId) && s.warehouseId === parseInt(formData.fromWarehouseId)
    );
    return stockRecord ? stockRecord.quantity : 0;
  };

  const getWarehousesWithStock = (formData, stock, warehouses) => {
    if (!formData.productId || !stock.length || !warehouses.length) return [];
    
    // Find warehouses that have stock > 0 for the selected product
    const warehousesWithStock = stock
      .filter(s => s.productId === parseInt(formData.productId) && s.quantity > 0)
      .map(s => s.warehouseId);
    
    // Filter warehouses to only include those with stock
    const availableWarehouses = warehouses.filter(w => {
      const hasStock = warehousesWithStock.includes(w.id);
      // If destination is set (Request Stock scenario), exclude it from sources
      const isNotDestination = !formData.toWarehouseId || w.id !== parseInt(formData.toWarehouseId);
      return hasStock && isNotDestination;
    });
    
    return availableWarehouses;
  };

  const getDestinationWarehouses = (formData, warehouses) => {
    return warehouses?.filter(w => w.id !== parseInt(formData.fromWarehouseId)) || [];
  };

  const getSelectedProduct = (formData, products) => {
    return products?.find(p => p.id === parseInt(formData.productId));
  };

  const validateTransferForm = (formData, stock, setErrors) => {
    const newErrors = {};
    const availableStock = getAvailableStock(formData, stock);

    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.fromWarehouseId) newErrors.fromWarehouseId = 'Source warehouse is required';
    if (!formData.toWarehouseId) newErrors.toWarehouseId = 'Destination warehouse is required';
    
    const quantity = parseInt(formData.quantity);
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    } else if (quantity > availableStock) {
      newErrors.quantity = `Quantity cannot exceed available stock (${availableStock})`;
    }

    if (formData.fromWarehouseId === formData.toWarehouseId) {
      newErrors.toWarehouseId = 'Destination warehouse must be different from source warehouse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitTransfer = async (formData, setSubmitting, setErrors, showSuccess, showError, router) => {
    try {
      setSubmitting(true);
      setErrors({});

      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity)
        }),
      });

      if (res.ok) {
        showSuccess('Stock transfer completed successfully');
        router.push('/transfers');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.error('Transfer creation error:', err);
      const errorMessage = err.message || 'Failed to create transfer. Please try again.';
      showError(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    fetchData,
    getAvailableStock,
    getWarehousesWithStock,
    getDestinationWarehouses,
    getSelectedProduct,
    validateTransferForm,
    submitTransfer
  };
}