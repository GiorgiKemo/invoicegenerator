document.addEventListener('DOMContentLoaded', () => {
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsTableBody = document.getElementById('itemsTable').getElementsByTagName('tbody')[0];
    const subtotalEl = document.getElementById('subtotal');
    const taxRateInput = document.getElementById('taxRate');
    const taxAmountEl = document.getElementById('taxAmount');
    const totalAmountEl = document.getElementById('totalAmount');
    const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
    const printInvoiceBtn = document.getElementById('printInvoiceBtn');
    const invoiceOutputEl = document.getElementById('invoiceOutput');
    const restaurantNameInput = document.getElementById('restaurantName');
    const restaurantAddressInput = document.getElementById('restaurantAddress');
    const restaurantTaxIdInput = document.getElementById('restaurantTaxId');
    const restaurantBankAccountInput = document.getElementById('restaurantBankAccount');
    const customerNameInput = document.getElementById('customerName');
    const customerTaxIdInput = document.getElementById('customerTaxId');
    const numberOfGuestsInput = document.getElementById('numberOfGuests');
    const invoiceDateInput = document.getElementById('invoiceDate');
    const invoiceNumberInput = document.getElementById('invoiceNumber');

    // Set default invoice date to today
    if (invoiceDateInput) {
        invoiceDateInput.valueAsDate = new Date();
    }

    let itemId = 0;

    addItemBtn.addEventListener('click', addItemRow);
    itemsTableBody.addEventListener('input', handleItemInputChange);
    itemsTableBody.addEventListener('click', handleItemDelete);
    taxRateInput.addEventListener('input', calculateTotals);
    generateInvoiceBtn.addEventListener('click', () => generateInvoice(false)); // Pass false for just generating
    printInvoiceBtn.addEventListener('click', () => {
        generateInvoice(true); // Generate and then trigger print
    });


    function addItemRow() {
        itemId++;
        const row = itemsTableBody.insertRow();
        row.innerHTML = `
            <td data-label="დასახელება"><input type="text" class="item-name" placeholder="პროდუქტის დასახელება" data-id="${itemId}"></td>
            <td data-label="რაოდენობა"><input type="number" class="item-quantity" value="1" min="1" data-id="${itemId}"></td>
            <td data-label="ერთეულის ფასი (ლარი)"><input type="number" class="item-price" value="0.00" min="0" step="0.01" data-id="${itemId}"></td>
            <td data-label="სულ (ლარი)" class="item-total">0.00</td>
            <td data-label="მოქმედება"><button class="delete-item-btn" data-id="${itemId}">წაშლა</button></td>
        `;
        calculateTotals();
    }

    function handleItemInputChange(event) {
        if (event.target.classList.contains('item-quantity') || event.target.classList.contains('item-price')) {
            const row = event.target.closest('tr');
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const itemTotalEl = row.querySelector('.item-total');
            itemTotalEl.textContent = (quantity * price).toFixed(2);
            calculateTotals();
        }
    }

    function handleItemDelete(event) {
        if (event.target.classList.contains('delete-item-btn')) {
            event.target.closest('tr').remove();
            calculateTotals();
        }
    }

    function calculateTotals() {
        let currentSubtotal = 0;
        const itemRows = itemsTableBody.querySelectorAll('tr');
        itemRows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            currentSubtotal += quantity * price;
        });

        subtotalEl.textContent = currentSubtotal.toFixed(2);

        const taxRate = parseFloat(taxRateInput.value) || 0;
        const currentTaxAmount = (currentSubtotal * taxRate) / 100;
        taxAmountEl.textContent = currentTaxAmount.toFixed(2);

        const currentTotalAmount = currentSubtotal + currentTaxAmount;
        totalAmountEl.textContent = currentTotalAmount.toFixed(2);
    }

    function generateInvoice(forPrinting = false) {
        const restaurantName = restaurantNameInput.value || 'N/A';
        const restaurantAddress = restaurantAddressInput.value || 'N/A';
        const restaurantTaxId = restaurantTaxIdInput.value || 'N/A';
        const restaurantBankAccount = restaurantBankAccountInput.value || 'N/A';
        const customerName = customerNameInput.value || 'N/A';
        const customerTaxId = customerTaxIdInput.value || 'N/A';
        const numberOfGuests = numberOfGuestsInput.value || 'N/A';
        const invoiceDate = invoiceDateInput.value ? new Date(invoiceDateInput.value).toLocaleDateString('ka-GE') : 'N/A';
        const invoiceNumber = invoiceNumberInput.value || 'N/A';

        let itemsHtml = `
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align:left;">დასახელება</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align:left;">რაოდენობა</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align:left;">ერთ. ფასი</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align:left;">სულ</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const itemRows = itemsTableBody.querySelectorAll('tr');
        if (itemRows.length === 0) {
            itemsHtml += `<tr><td colspan="4" style="text-align:center; padding: 10px;">პროდუქტები არ არის დამატებული.</td></tr>`;
        } else {
            itemRows.forEach(row => {
                const name = row.querySelector('.item-name').value || 'უცნობი პროდუქტი';
                const quantity = row.querySelector('.item-quantity').value || 0;
                const price = parseFloat(row.querySelector('.item-price').value || 0).toFixed(2);
                const total = (parseFloat(quantity) * parseFloat(price)).toFixed(2);
                itemsHtml += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${quantity}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${price} ლარი</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${total} ლარი</td>
                    </tr>
                `;
            });
        }
        itemsHtml += `</tbody></table>`;

        const invoiceHtml = `
            <div id="printableInvoice">
                <h2 style="text-align:center;">ინვოისი #${invoiceNumber}</h2>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div style="width: 48%;">
                        <p><strong>გამყიდველი:</strong></p>
                        <p><strong>ი/მ:</strong> ${restaurantName}</p>
                        <p><strong>მისამართი:</strong> ${restaurantAddress}</p>
                        <p><strong>ს/კ:</strong> ${restaurantTaxId}</p>
                        <p><strong>ანგარიშის ნომერი:</strong> ${restaurantBankAccount}</p>
                    </div>
                    <div style="width: 48%;">
                        <p><strong>მყიდველი:</strong></p>
                        <p><strong>დასახელება:</strong> ${customerName}</p>
                        <p><strong>ს/კ:</strong> ${customerTaxId}</p>
                        <p><strong>სტუმრების რაოდენობა:</strong> ${numberOfGuests}</p>
                    </div>
                </div>
                <p><strong>ინვოისის თარიღი:</strong> ${invoiceDate}</p>
                <hr>
                <h3>შეძენილი პროდუქტები/მომსახურება:</h3>
                ${itemsHtml}
                <hr>
                <div style="text-align: right; margin-top: 20px;">
                    <p><strong>შუალედური ჯამი:</strong> ${subtotalEl.textContent} ლარი</p>
                    <p><strong>დღგ (${taxRateInput.value}%):</strong> ${taxAmountEl.textContent} ლარი</p>
                    <p><strong>სულ გადასახდელი:</strong> ${totalAmountEl.textContent} ლარი</p>
                </div>
                <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; display: flex; justify-content: center;">
                    <div style="text-align: center;">
                        <p>_________________________</p>
                        <p>(ხელმოწერა)</p>
                    </div>
                </div>
                <p style="text-align:center; margin-top: 30px;">გმადლობთ, რომ სარგებლობთ ჩვენი მომსახურებით!</p>
            </div>
        `;

        invoiceOutputEl.innerHTML = invoiceHtml;
        invoiceOutputEl.style.display = 'block'; // Show on main page

        if (forPrinting) {
            // Defer print-specific operations
            setTimeout(() => {
                // Hide elements on the main page temporarily, except for the invoice output area
                const elementsToHide = [];
                document.body.childNodes.forEach(node => {
                    // Check if it's an element node and not the invoiceOutputEl itself (which has ID 'invoiceOutput')
                    if (node.nodeType === Node.ELEMENT_NODE && node.id !== 'invoiceOutput') {
                        elementsToHide.push(node);
                    }
                });

                elementsToHide.forEach(el => {
                    el.dataset.originalDisplay = el.style.display || ''; // Store original display style
                    el.style.display = 'none'; // Hide the element
                });
                
                // The invoiceOutputEl on the main page (where the invoice preview is shown) should remain visible.
                // Its display style is set to 'block' when the invoice is generated, before this 'forPrinting' block.

                const printableContent = document.getElementById('printableInvoice').innerHTML;
                
                // Create a hidden iframe to host the content for printing
                const iframe = document.createElement('iframe');
                iframe.setAttribute('id', 'printFrame'); // Assign an ID for potential debugging
                iframe.style.position = 'absolute'; // Position absolutely to not affect layout
                iframe.style.width = '1px'; // Minimal size to be non-intrusive
                iframe.style.height = '1px';
                iframe.style.left = '-9999px'; // Position off-screen
                iframe.style.top = '-9999px';
                iframe.style.border = 'none'; // No visible border
                document.body.appendChild(iframe); // Append iframe to the body

                const iframeDoc = iframe.contentWindow.document;
                iframeDoc.open(); // Open the iframe's document for writing
                iframeDoc.write('<!DOCTYPE html><html lang="ka"><head><meta charset="UTF-8">');
                iframeDoc.write('<title>ინვოისის ამობეჭდვა</title>');
                // Define styles directly for the printing context within the iframe
                iframeDoc.write(`
                    <style>
                        @page {
                            size: auto;
                            margin: 0mm;
                        }
                        body {
                            margin: 20px; /* Standard print margin */
                            font-family: "Sylfaen", "DejaVu Sans", "Arial Unicode MS", sans-serif;
                            font-size: 14pt;
                            color: black; /* Ensure text is black for printing */
                        }
                        table, th, td {
                            border: 1px solid black !important; /* Ensure borders are visible and clean */
                            border-collapse: collapse;
                            padding: 5px;
                        }
                        th {
                            background-color: #f0f0f0; /* Light grey for table headers */
                        }
                        h2, h3, p, strong {
                            color: black !important; /* Ensure text elements are black */
                            margin: 0.5em 0; /* Basic margins */
                        }
                        hr {
                            border: none;
                            border-top: 1px solid black; /* Simple horizontal rule */
                        }
                        /* The #printableInvoice div is the root element of printableContent */
                        #printableInvoice {
                            width: 100%; /* Ensure it takes full width within the iframe body */
                        }
                    </style>
                `);
                iframeDoc.write('</head><body>');
                iframeDoc.write(printableContent); // Write the actual invoice content
                iframeDoc.write('</body></html>');
                iframeDoc.close(); // Finish writing to the iframe document, causing it to parse

                // Function to attempt printing; polls for iframe readiness
                const tryPrint = () => {
                    // Check if the iframe and its document are fully loaded and ready
                    if (iframe.contentWindow && iframe.contentWindow.document.readyState === 'complete') {
                        iframe.contentWindow.focus(); // Focus the iframe (good practice before printing)
                        iframe.contentWindow.print(); // Trigger print dialog for the iframe's content

                        // Cleanup after a delay to allow print dialog to process and close
                        setTimeout(() => {
                            if (iframe.parentNode) {
                                iframe.parentNode.removeChild(iframe); // Remove iframe from DOM
                            }
                            // Restore visibility of hidden elements on the main page
                            elementsToHide.forEach(el => {
                                el.style.display = el.dataset.originalDisplay; // Restore original display
                                delete el.dataset.originalDisplay; // Clean up dataset attribute
                            });
                            // The invoiceOutputEl on the main page should remain visible as per its state before printing.
                        }, 1000); // Delay for cleanup (e.g., 1 second)
                    } else {
                        // If iframe content not ready, retry shortly
                        setTimeout(tryPrint, 150); // Poll every 150ms
                    }
                };

                // Initial delay before the first attempt to print, allowing iframe to initialize and parse content.
                setTimeout(tryPrint, 200); // Start polling after 200ms

            }, 0); // End of outer setTimeout for deferring print operations
        }
    }

    // Add one item row by default
    addItemRow();
});
