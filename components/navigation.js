"use client";

import { MdOutlineQueryStats } from "react-icons/md";
import Image from "next/image";
import { useContext, useEffect, useState, useCallback } from "react";
import { authContext } from "@/lib/store/auth-context";
import { useCurrency } from "@/lib/store/CurrencyContext"; // Import the currency context
import { currencies } from "@/lib/store/currencies"; // Import the currencies
import { db } from "@/lib/firebase"; // Import Firestore
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore"; // Import Firestore functions
import jsPDF from "jspdf"; // Import jsPDF
import { toast } from "react-toastify";

function Nav() {
  const { user, loading, logout } = useContext(authContext);
  const { currency, setCurrency } = useCurrency(); // Use the currency context
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value); // Update the selected currency
  };

  const getFirstName = (displayName) => {
    if (!displayName) return "";
    return displayName.split(" ")[0];
  };

  // Function to check if the user has income or expense data
  const setupDataListeners = useCallback(() => {
    if (user) {
      const incomeRef = collection(db, "income");
      const expenseRef = collection(db, "expenses");

      const incomeQuery = query(incomeRef, where("uid", "==", user.uid));
      const expenseQuery = query(expenseRef, where("uid", "==", user.uid));

      const unsubscribeIncome = onSnapshot(incomeQuery, (snapshot) => {
        const newIncomeData = snapshot.docs.map((doc) => ({
          id: doc.id,
          amount: doc.data().amount,
          createdAt: doc.data().createdAt.toDate(),
          description: doc.data().description || "Unknown",
          source: doc.data().source || "Unknown",
        }));
        setIncomeData(newIncomeData);
        updateHasData(newIncomeData, expenseData);
      });

      const unsubscribeExpense = onSnapshot(expenseQuery, (snapshot) => {
        const newExpenseData = snapshot.docs.map((doc) => ({
          id: doc.id,
          color: doc.data().color || "#000000",
          title: doc.data().title || "Untitled",
          total: doc.data().total || 0,
          items: doc.data().items || [],
        }));
        setExpenseData(newExpenseData);
        updateHasData(incomeData, newExpenseData);
      });

      return () => {
        unsubscribeIncome();
        unsubscribeExpense();
      };
    }
  }, [user]);

  const updateLocalStorageHasData = (value) => {
    localStorage.setItem("hasData", JSON.stringify(value));
  };

  const updateHasData = useCallback((incomeData, expenseData) => {
    const newHasData = incomeData.length > 0 || expenseData.length > 0;
    setHasData(newHasData);
    updateLocalStorageHasData(newHasData);
  }, []);

  useEffect(() => {
    const storedHasData = JSON.parse(
      localStorage.getItem("hasData") || "false"
    );
    setHasData(storedHasData);
  }, []);

  useEffect(() => {
    let unsubscribe;
    setIsLoading(true);

    if (user) {
      unsubscribe = setupDataListeners();
    } else {
      setHasData(false);
      setIncomeData([]);
      setExpenseData([]);
      updateLocalStorageHasData(false);
    }

    setIsLoading(false);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, setupDataListeners]);

  function handleGenerateReport() {
    const logoBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI0AAACTCAYAAACzgppOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAFdiSURBVHhe7b0HfBzHfS8+d7d7/XDoIAACINh7VaGqVUwVihIlWcVWsaziIvckTuLnvJe8f/IcJ3acxFVWZNmSHcfdslxk2bIl2SpWpUiRYicBgkTvuH63u/f/fmd2ARACcMciiZT05We5i73Z3dmZ7/zalHXl83nxNt7GkcBt79/G2ygab5PmbRwx3ibNJDAty2cfvo1J8LZNMw7DyXjzK537bzg41HvR/OqG/1laN/u7ukdL2j+/DRtvkwZI5bLlL3fsvuWFgy+9P6NnFyWTSZG3XKI2UPP4Oxec9U+zKuoeQ7K3C8rGW5o0hmkGthza/Z6t/Ts+sKd39+mazy0yRkb+ZlmWiAQjQrN8Aysql/xwZd2Sb88oqdjsdrtzMsFbGG9J0oAs/p1drVc+d+DFD/SY3edlRdpFsljCFCCFyGazIhgMilQiKXy+AIwct/C5w8mVlcu+eeasVV8pD5fstW/1lsRbijSQHvqerraLn2vb9PF9I7vX6SGXSKbj5IRwCQ/0jwep3CgUld4FGuVdkmRC1wPCl/eLykDV/qXR+fecPmf5XX7dO6xSvrXwliHNwf6es57Zv+kje4f2Xu0OZH2xzKDw6JbIWAbIooEgOqyWcaRxWdhbpI2QKTRNGOkcJI5fhLSgqAvWbV1WtfjLK5sWf8fjdmflQ94ieNOTpj82suCFAy/fvntoz02D6f5ar98tBmP9wuvXhAViZHJZoen0sEkWiBXAZdu8bpDGxLFp4ViDJMIBCILzLpEYSYqK0ur8DH3Gk2fMOu3LC2vn/OKtQp43LWngPjdtbdtz0ys9u24ZFF3zciIjclZWpFIpES4pEZlMRpggBSWIZZn2VYAtYeRhnufdwsCfJlWU14/NI20eXfMJlwsKzBDCa3hTTZHmP5zdfNqXZlc1PIrz6gZvUrzpSJPKZspfbt97y5bObbd2xQ8t03yW6I/3C38oILKZnAiFIiKZyEqD1+fziUw2hWNc6CJBUNcusIB7gGXjRvH49KDI5kxh4NjCljVyIhgOi3g8LvwBn0wTDZUKc8TMLClf+sO1zWu+Ulta+YK8yZsQbxrSGJbl297Rev2zhzZ/tDNx8NRcPik8mikN3WA0JJLJtDBR615vQJhQIl6vTyQSCVFSEhE5I4U7kDA2cWyMlg2u8+G6HKSNAeXl9uo4NiChDOHxuIVl5iCgYBW5vCKkR4XPDA0uKJ37o7Pmrv73ikjJbnWTNw9OetIg/55dna2XPdP24l+2p7vekcwOC8tjChdsWql2IAaSKRAHLrTm1iVxyAt3XkmaXC43Rg4Ada/2o/YN72MIrwZXHHqKp90ej8hA2vB6XpvHSe51GNRmDrTC/YP+kAh5QodOrV39zZV1i79ZEgy2yxu+CXAyk8Z1cKDrnGdaX/xES6xlfSqf8GdyaUGv2aCh4XZJO8Tv9yOpJcnhhg1C5DJZGbijXeN2e6RtIkAiB5bLLSPCijJQUR4LdkwabrcO6eUWqXRG+AJ+adswXd6F8yCSBj3He3phNFt5SCFc7hVhUSnq95/WuPLLK5rmfMun6zH5kJMYJyVpOof61vy57YWPtYzsuWo4O1iSkz4OK9iueBJA2qJK1fAdbb7I8/JvvLaL4ggAbeQ5D8hCohEkkzBAHpBPeOB0wyimtwVfijSSEofPyTMdXHVKG0ov/uB4X4zzUGJ5IJG87qAotSIvv2PW6f++Yua8/4GnddJGlk8q0nQPD66E+/y+vbFdN43keitSZkJ4A16RhoHLWAsrz2VLDMWRMeJQ8pAoefzHd2blw8lWP1FCpBLC7wvKvyUfIEHS6bRUayakhlJbNgnVZZI8lFJKPfEE3XZHYqk9nfYs+MFnhjxhoVsBa2HJ3N+d0bTqC81VdY/KRCcZTgrSxDOpGZvaXvnAnoF97+uKtzcnc8PCBY64NZdIZpJCg1ErpQtlhv069GgkpMQBSUAatwW1gQqX7wyjNw9PyeWGcWsYIhwMiUwaVDJJKNwJ9/Z63dJY1jwkE5lCSeJQzSakbTyThASJJPLInIwwa/JZuWxSlJVFRTKeER78Rm8sIMIjCyrm/mzNzMV315VVPQ/VqW5wEuCEJg07FDcf3HPz1v6X7zw4vH8lXdxAOCArNJODPaJr0oZgrIWQ74JW77R1h0CM67LS2VUg/2ato45kPYFdWdhCjLsYMHR1HcYtfqYNpOncmyBNwCaCG//IOkipvK2qaLvggZQohCQlpR5YbVLywUcPQoWlk3GZX7cHxjhTePx4viaCrlDvsorFPzh79ur/KA2GW+RNTnCckKSx6BF1t12+qWfXX+/o3nam158TWSslOw/jMbR8zQsj1MDfuoyxGHB5WYlKqtjkkQekD41apUakVIB04e+SRjBgCekNZXl/tefVfFYqY8LVDgojx/uAcri/SzrdVG24A4M2OPKAHBbuTxrJHECqUQ2SHLChRT6ZFZVl5WJwZEh4/JpIs+uChjpu63F7hc8VEmEr0n5G7Zr/Wj1z0b3RYOiE9rROKNIgL+5DQ33nPNHy4t/sGd57fjI/EqDmScFl9sOYTMTTIhotg7inGkHFoWLo1fi9kCATgnKsTJKGnhClj0MaV572BSpVihsascr4ZaQXf0gi8ieSMp/X5Z5qkEawIo1FGkrSKPuF91f3kb+SuJI0JkhjglAgoKkJi64+OJqxskIP6CLDYJHO6DLyjd+jgXJhJtxiVnTWtlUV8+9a1bzgvhN1ANgJQ5pD/b1n7OjZ995XBnZeNWz21QjdEPHsMKQIxLuvRCRjaREIhFDZSExJYbHyGA+BioLNIAljSxpZrSAGycIWz/OuUV0FAin9hD2kBMjk1aEqUOlBLdDRHG1+oMRX0rlvqPXq3uTA6jyM2IQ1DE7AvcZzJVFsskhvCfchVLZgD+FPSVB5TnlpjN9wYBeN9mA4KIZGBiUxvX6fYCjJB5UYG4qJaKhcZBI5UR6qsCo95X86Z+4pn58/Y9bvcL8Tyt55w0kzEBuZ+1Lbzjtbki3vOTR4oNbtsyC+kyKZjolQaQh2BoS8iUq1qIpYyW7Zf+SnagKDTCsnYyR5u79I8gE1x1ZP5EEYyCP+gmqmoQy7AgYxjz0gDf+V6JHu5uisX57WvOZrtWU1m3ldJpct2Xxg+/u29ey4vTO7Z7nhTkttZOEa2ip8HAlC2BzBE1Td8t6STDIzOILRIwmHhJlMCuQPSNKzO4LnzJwlwuGwMLI5aVf5YF8xJqS7tPTcyLwH185c85XGyhlPyZudAHjDSJPIpGqeb916+56hvTd1xTsXGS5VsRYaFQlgihxyxwpn8bMXmhWAgsf/kgAy22zpOIuK5HtQ0us+r6wIaV+gYngfry8vUiChJvzC6/YJnxtudNoU1ZGKWJ2/7pdrGlfcXV9R+6zm9qhhe+MQS8XrXjr40gde7tt883BuZHYGFUtbJIc88p8LqouZMWlX4blUez4PbC4Oo4DtZUpph9zI7CvPyxF6SlLhtF0HUrXhnjI8gIQkG72tGm9dzyx/409On7Pqrupo+TaZ+A3E604ajvTfdGD7HS/3bb+9L9u5KmnEULEoVDsfbMFS6PNvWdisGlW4skDx96g7zfMoVCMHbwQGqwsSh16PrEzUjCQPbJ1sDpJJ90q7IgDCaKaWmR2d+8dTG1Z8ZV7t7F+jfgoWwkgq1vhC60sf3NL9ys05b65hIAkVA3c9Z2VklwXzT+lg4PlUR/msJSrKKkVvf5/wgMhKKoEMfC2QZTzpHcjgoSQO7seEII3GCzN5EfJGRdAK9yytWfJfa+es/HokEOyUCd8AvG6kMS3Tt72j5ZrN3ds/0jq47wzLa4pUNibcMEApEVSBMjiGsrKJQ4OThWfI4CnTqAJVUClIGjfEeTqdVeNecIquModOGQZD/xD1WlikYSuE/b58uaf8pTNmnvqlpfWLHvDp3iMO6ffHhxb+ufXFO1ti+6/qM3obDEiyQdgokUhEEjbo9wsDefFqmhgZGhYlJSXCgOEyRnxnD9j6TUWm+baKfKpOlMdH8lsmiIlzAW+J8EJa1oRmbl1WOf8byxvm/zcawwjv8XridSFNS+/Bi59pe/ZT+wYPvDMPd2I4OSzjLez0M/KGdKEJtj5uY6SxvRAXPB67BY6BhFHeEYc80EimF+Rhhw/tRkiYRGJEhPwlaK1RUeap3HnazOVfXj5z0Q8D3sBgMdJlOvQnhhY8c+CFT2wf3HG94cmV9w31wvNiB2hGaOyOgK0VCYWlAUw1Q4wRZ5Qv8h1c9PDs95EGvHxVaYHhFOifT6IxMP6E3w2XCPiCKCOPqPBUbTpnzmlfWFw37yew9+g+vi54TUnTNdy/6oWDWz65a3DT5TktUTYcywgPpIJHD8DGYPBMGbeMs7CkpPkK/cQipMRRwIEjsuX/JAqOx+Vb05TbnE3B/YaBzPB/WUlUGshBK7JvReUp96xsXPb9aDDSZl9y3NA51LNqS+f2D2/r2XJdzpMuSYM0NHAZdAxFSkQiGYdqZLCPSlOBvBglDQGy8L2gjKRN5IKhTXtHemogjVtnZEgNICsJh0QqEUdx5UUkGAaxtFxzZM7vT2849T+aq5t+z1urm752eE1IM5CILXi2ZcvtbakDN/enOmfE0j1C90MN4RXdLj/ErQukyYpQqEQWhM5Cxa8MhynyOHly7BcWKkFaKaNXFTolijyDpIbIpLKiorQCRa+LbCzfe/qsU7+1on75/VWRit0Q9a+p23qgr/3cZ1uf/8j2gV1XagGPN55JIK+MOuNH5JGNYTxRDjsGURyPSxIFf0nSsHVAwpCIQUjmOCRnIACngK8ClUeVRc8r5AN5cr7E4oqlPzl99pov1ZZWvSRv/BrhuJImncuWbWrb8f5t/TtvG8x1LzCttBiMjYhwaZnoHxwQQb4wyYEXlj0zcqglMgHxzHzI6pctUhmyjoRxwzuSxKGryzSSNLwQBScjtBzDkhcVJZXCjLmH5kUXfx/u870zSqu2vp7jdhnJ3ttz4KIXOzd/dFPP5kvYVRkI+yB1VIe2agDIttqNQpJGssuB/d4gDiPHbGQsK9psOSMjDW72ulOiRiOlsNeSwuPyipJAiYi4SzqX1yy9b3n9wntKQ5EWeaPjjONCmqxhhF/paL3p5a7tt/bmOk5L50ZEPD0MNYSK9uBlTY5D0fHyqD9Uto7zmTR0PYjBMSiqX4egGKbEwRFKmB2K8qzd+saTRv3AFpyHi8tYS8nQ7PDcn6+pW3XPzIr6Z4+lAzCby5VAtaWOdvgCybO7Z/9lTx947mMtydbzMlZaYyjBcbFle8CeA9TxUpIAyuilt4czsgHR+1PBQXZ3WCbfmY2K10IqgUwkTzKeEF6vV5LOSOVgwwUF2pAoD1QcXF6z6J5Tm1ffFfT6+/jc44VjIg3nEe3oOnDtlq6dH9g/dOCcnJWGE5qWrijrjB4MoQqLqgUFQqmCl2fhsEUx+E797GFsguFRdgaCSCwQdlD6AnCVkUqOyw0GIaKpznwgoiU7/XSXLzsv1PyH0+pXfLm5suFPuqYfdegdkjL6ctvOd+/ub73Fq3t7T29c/q9NFXVP2z8fMay8pW1v33v1H9ue+Ktu0X1aNpOSwUkrp8pcd3thz8EzQnlRDJkwcj06vC9IFkpSF2xbdpUwCOkMv7Bl0Bh5AKXWWZlyh7PsJ1PeV22ofuvK6hX3rKhf9N8Br39QpTg2HBVpcI1ne/u+jZsObb2zx+x5RzKT0OEHwcpH+5CBFtyTUoLqA4eOWHb6gUgcwnmyNIDlX6AHdnnYJzRsS+B95EAkw22JVCYr70V1FvJHYc64xcxAwx/Xzlz99UUz5v5K146+n4aSYcuhnTe+0rf7A/sH9p+Vg+fDEL87p3WvnXnKN85oWvnVoM931K2V4YaXDm27+bmO5z7Sl+1dmUglZQPIZgw8OyfcHtW42KcGq1fgVYXf74VqyskedDekDKWtLYNHiUNpQ4zVofqFJUvJI6UX0vl9JaLBP/OFlZXLvryyccF37URHjSMiDQpXa+3rvuS5/S/e0Z7puChtDgcS6RGhQTzyhWhhENIe4QvY1GcPsHwREMpD7wibfUYSyWKBuD1SZ9MT0qC+8iCNQCtM59LC7UPrMywRhsEX8UaEPuLbvLbplLuXNSz6SdB39KKX03N3dbVc8XL3ztt3dr2yDmYBnHtISORDufIG7KRyUeWJ7lhcOe/bq2ct//axPC+ZTVU81/r8h5/p3fTRgcxAtWoqkJhoFEYmLV31IDyiHEhjoHVw+IfPDw+TIehxGKWGKm5JDtYjieXUJ6UNwfdgA4z4oiIf18T8irlPnjJr6Zfn1Tb8WCY4ChRNmq7hgVOe2rf5r/YN7788mesLmSIlNHhEHJdLMelIEbYAvgTbBWlBmJI0eBgqxMPxJ6wV+RsLjfOK4O8EAjDy1PQQ5snrc4vhwUFRWVkJgy8DVzMqornotjW1K7+xvH7Rj6G7e+RNjwJUq7u72tZv6dx1Z9tQy4XCD5Ey0CkipWExApWoaX5kTRPhYEQkRoaFXzNgZIZFwCzbuab+lK+uaV76Tc8kXQ7FoifWt+SF9pdvfXlgz80Ja7jaNBN4R6hi2H8M9FHi0PCF0EFjgYqCzadiOWOEIWTUGHB+QyXIneqQ5XmqL0t2edA7C7mCkJ6wL009M69mzqOrmhbdNadm5i9l4iNAUaTZ39dxyWOtT3/xwNCBxcKThVEL99ZMgcGqw42Zk9NakTUSh6+g3ofShXsFaeRBV8s+FmxSi3HDDx6PjsJCK4c949Jh2GHj6H8/7JeKfKh1ZdWyu1c2Lrs/4g8ddficknJ/96ELdvTsu3V3374r4sZI0K0bImslhQk1wX4kzqSkbWEiT7kMJKMHbwY1keMQDC2E/ITNmcFZz6yuX3HX4rq5Pz4W76xjsHfl84c2f/z5zj9f7424gxyoHoMnFPCGUIY0hNMy3qN7g5RHsqwdqGJVfyt3XZWj3NsGtwQK2YD8lAPfTU0YyayoLq9Bg4RXG4ymV9av/NaZzav+T8DrG7CvKIiCpMHvnnue/tkT7WbbGRTeqUwMpMnLuUIc6a9G+dP7Qctg5kkaGLa0bUglvgaJQSFEiSMHJ8mTbDP0foT0fswsJAw0Eifacwz/SDIt6qub2hcEZ33njObV95SFoi344ahAg/TgQNfalw698tFXOvZs8Eb0UCaXFLHUEEjC/KAh0KODoapcWxriytgOQDWmIAXkDIMcx9RowuvxQZX4RWOw+bFTZ678zwV1zb+wH3VUaO07+I4XOl786HMtL1wVioY8VMVZ5M/rN0FmbmyMigi0Bx0DGIWIjUFBRZbx3pkDNtKUBcLDRrLShgh5AyKTSkuVxeCj7g6JpeXL77908Tl3uGl5F4GCpOkeHl7zrRd//nhaHwyPxAZFIOSlFy2SSTWXiA9nR6BSSUqnkjTILgpYnaeIwREooqx+JXG40eq3RDqVEKGgH63YD7r42DHXOb98wU+XzFh8f21p9ctQBUfbml39saFFz7dv+uSWnpevz5pGiQde2eDwEKQKiOFDy2MYAHmAVaFsKeRfztlGy+Q2PBwT4VBU2lQGVAUbipHNyAoKQI0FtVByQcXCX62oWfK1xsq6J/G+4zVI0WDj3NvVsv6FA5vv3N6z81I97BaDyW7hj5C8yjtyIsfcULqSPFLK21WoqEPyKElOWPwRHKMU47SddCwhB5xRc7E+YDaK2mhTYl3jO25bVDv7R/KiAihImm2H2m57cN8f7u2NtYmq6nIxONgvH0qDlf0q7G/hSzHzivGUHqQIzykLnkMXxloKX0TtmZaShx2WYX9I6DltcEnFogdW1634Zl1Z7fPFMn8yDCdjTZvbtn1kW/+2G/uzvXWmnhdJuOt8li8QlBLSBVUo3x8FTILkYIGyRZLEVEuyIbgheQx2A+iQPlBdeFcjl5LXBaBCSTCvyydAn8TyGSt+sGrmsq/OKK2UY3KOBvC0vHs6W9dv7tx2x/74vvMyrmQojefJsiKhpe2IjSEKW+o4ZFHksTnLBovGK3vO4WTwWo1pWTc4x/NZTgL0BED+iFhcsviBdy2/5Gp18fQoSJon92z/5z8eeuJ/JaxBPBjcREFzIhjBuBwrgTEVdgdQtJNM0vOhF8KXxGbCkOOY22wWIteno8VmZeGzo9KNygh5osPzonN/s6Z2yV2NFXVPHwtZEplU9eZD2+/YMbT7loFM9/yR9LAwOMSTJTtKXKeYUQC2JFRQBU65qI65sZJ0nOG13Eh0prHTIik7WDW4Xm5LF5WB6q5FlfPuW9209O7SUKRVJjpK7O85dOmTLc9/siW2e13OlZV1xQ7MHMqP45pZD9JgRkWwEbAepA2EPU0GvlUGEsZD1QB44HA4MFHEJuNpIJbPExSNvqZXbjnlurVeTY/bSaZEQdI8vO3572zqff7mlNkvCSBHoaF1seBkZyOIRAKEQiEpAtnLq+OFUNKSQB6vD0YkhymA3RxQjcIO+dXI/xK9NN4YbnpsZc3yu+fXzn4It5w+M9Mgk8uVbO3Y9YFX+nbfdCDWsiLnyoh4cgTqFEakocQ7ci33o+SQ3gULwSGNkjzOqhFUAooeDmFIOPWbDL7ZJGT/D1WrARddd/sggQKiKly1f1H5nP9a07Ts3sAxRmS3HNp10wsdWz7YOtB6tos2mJVFuWfo4IE4OAaJNC+IDfL7/UE57thAnnTkiRJUagKS21TOCvNOwpgeeqomDAKvqPXWtt665sa18Eq71VOnRkHS/OrlZ368tf/pa9LWgCxQadBI0lCfqvbG82Q8pQ1D2jpUFvtFTDtIx4zRFqCHpEPcuwxPujnS9MfFZQu/s7Rx8YNgd0I97cgBFz2y5dCOm7cP7bxjZ9crq1w+l+w9jyc5X4nLgVAkKwmh9DwIJPfORkuM5EFh8k/slRdiX2PDGVUn3Vx5TIYjTZ73h+BndBfeH5UFS4VTVqorK0WZVv7SKfVr7lnZsPjeY/G0UMaeFw9sf99L7ds+2JPpOjXDwWtyCGpahEvCYmhkBIazX8aWvL4I9iAFPI6gPyBJxTeSpEFeJWk8lDQgDWw5L96hRq85dNspN62NBMIFZ0IUJM0vtzz1s22DT1+VtthYWCAcNIUj2irUlShguqmUMhSDZDZavbxW9onIq0zpTsNoTDeXzn5yUdnCexfWznvY7/UNyYRHAcZaXu7Yfeuzh56/rT3bcboBD8ENu4XP1tAE2UkYDKDw0uyWUBJFEQaaD16gJAQrH4QaIw1zC1I76krqIZYPr6EdwGMlZSVwrVR1qAhKTp2NAoQ1UBbS2GQ0G+d9nrDRXNL05IrqJf+1rGHej49F/aKRhJ7f//KdW3u23taf7V5kigwI0ytCpSVqUQJ/WMRjSeEPhFEXPrluoBe2mAxvcHlkmedxpEGDZi1VaFXdt6+58YzSIrzUwpJmy9M/2TL45LvS+X78dThpaCTSpqFBqWwbJWEs6EkOnuYKDewD4Si2Gr3q+VU1q766eOaiB/2676jXqmOL29W974qXejZ/ZE9szzl53fCmcgYKzJRLfTiqIpeGjQUOcKaB6mSGBJF1RRWJBi+lBQgABlD/47aKJCSPwwpKKLs7RJIMvzlpHEg1Rd6gHKV9hBJKpwwZ2eWUG3qYFqQty0OH9zsnMuc3pzet+XpzRd0f1B2ODslMumLTgZfvePbAcx8y/casZDYOQoEIlBxQUVywKZlIy5GDjDHR23NZduMgaaieUB40F7yw2cq0iv7bV9+wtjxcWnARyoKk+c225+9/se+P703nGftR1rosILZQkIXHnOtMCSOPUUA0ekkcGmXzKxe+uCy68GtLG5Y8CN1edABpMrT0tq978eCWO/bGd200tZRvIA6VSdsOxjQamRyfw3xl4SWxdZE0nFbr9ZWoG4AALjeJgsQoOPnuJAakC8ng2DgEilUKGTrj7DRUGE8abop4VMN039lISByN9g24xiENLCMpaQ0ungSjE/ZOPuM1l5Yt/v4F88/4t+po2Rbc5KiRyKRqnt676eNbe3feknWl6jOQuPHUiODytlIbMLsyBAJ5KiWpIroijSoD3fKKUk/V4O2r331GZUnZLploGhQkzW+3v3Tvs91P3pYSQ7IQWbC8huIO5QGmmiAIPSFIHTMnVRLJQrW1uGbR7y6bu/720mD0kH27o0LXSO/qZzte/IuD8a71iXSyPJ6KyzzQsNZADoEC4LBRAzXFgpIqAnmiRGQLZzBLSoFRiYF843r17iA+ClMSBmk4JINqzIIK4zgdrvrgZrRbkkvBMZzZeqnJ+O4EVSIrxAubjnnheRkHQkZYLuy1J7Etw4em5xN1oZq22eEZP1vVsOj+mmjVUbvpxMH+7rW/2fHEF3qznWePpAdEMKKJWGpQ5Q2NilKGE/dYY4o0VE8gDc5rZkCUu6uHbj3l2jOrSsp3yBtOg7GSmAqoGwaSpAElWySZwsvsDce6DrUACZOFPUGJQ1VVEg2LkDu061gIM5gYmff4nmf+84c7fvSbTX3P39Q+3FY+lB5Cq6VK9KJSUTk5ZJCzF0ES8ocqiN4FwfnZFNEE18+TfHDyLfNOm0ypI5JcUUGBdo48h2tMqFgVzbZ/BHgH/iZbL/KQg+3E6aBczCgDFU1/IZtL4N6cqcmZoFybGL/Bs8lC6uREUhyI7218qu+ZT979zN0PPdXy58+MpGL16u5HjoaKmmcWVjc/wsbCeJIcqwzC0DWXQGaZf+cduJMNX/5B0x0mPgQl/ywEec10wK3s/jBUFDZ2RMLRRh644VFolSaXEsPjdFjqHMbJjJJEoDe0lFSkR4SRdKzx8T1Pfe6nux96+E9tT32iN9ZbbabZcaey69JdKPSsMPWcML05YehZYenIg8b+I0gSGfhCJSMLnIPkhppAe5KDsgXHrNDbcYxX2GFShaAEeY0fxqPfCnbM0GtfLPNWZ2k8siwNNFMSh9NkOPNBd/ulXa2jcBgB9+B92azMXEr4YASn00m0J1wJJ8HNPLjgxZgoCnqP0JumC96lOyMy1ohI+bK1j3c+9dnvbfrZw8/u2/LRnGmoNU+OEGg+brffEgw3GCRJ3ou2pBo630HVHqWOjjwzrkQTmPlD7aKxqdEJhVGQNPKJeBRtABmexrF0tPG33CaA5CH4eOSBfxXFXiKWTsz8c8tz/+u+5+777RPtj3/6wHDbbJMGP+7AzenoZPcDx5rk6QXhWLnDAAuHHEUmSBiqBZKXc7FJJFKcqouBMLZ+L8SBi8RBMdREK0VdoHrPubVn/d8Pn377O+849Zb1G2dfft2KqlV/dGU1EdLCwsrQsNdEGJ4J+6n8Aa9IQFW6PJbsXmHkNpvNKPLB/WXwksQc60Bk/mlYQ/pQVcq84yxerm94UHRn+pY+dvCZr3zziZ89sbl19y32RUXDEgxd244ZnslVKaSWsKtAhQiYF/yGcpKNkGWGwoKqR5UVxxrnbV4TMH4pdwUwkkw2PNuy/a9/9spvf/VYy1P/nNWNhZyZSJGehBdkemBKoqXnuSIVByx5slINuUEWOsyayTEnAbT2gNAsP1oQ9DcKitKQk+UykEspV1bk4L4kzYRwe1GUKF4PCisEEtUFq1uXBRf+83uWvuuyC+af/f9VRyp3hH2hnsX18x+8ZumGDbcvf8+Nc0T9E9W+csuX0+DGZyBVNRE34sJX5hWxfEwM5gZF1pMT/pIg1Ccc4RTURD4Az8QnG5kLrd+NnEBxYE97iY2QUopDOXURCVaIZConunu7RVKLrf7tnj9880cv/eqh3Z0tG+xiKgaKHRI4xP3HCFsAyIpSYIVRzB1fdSNlQI5BGpmTgrptEnFkA/dxP7/vlU/8aPOjv/n9vqc/v6dr7woOUeAgdI7U88NdZRyEveI02pSkUS1VVgTuQeNOGnkW4yuUGdxAGeYJP9Jboh3L2QHs0aakoQTQUJgzQjNaT6lc/W/XLX/X+nVLL/i7ypKKPSpnY2BYfVHt3P+56fTrLls/56IPNYaaNpX4IihhqhoXpGNceEv8UJVUX5ZIwL2V02ndUANQhYwZSZXuSGnsFWFk6chKNWDnMI7F/q6S8rDoHTokkvl+bWvXs5c+vPehH/70+UcebO3tvFDlaHpIR4XFZFfR1HVzOChz7MOCKEgaGkcOSSaSZfzf49OMP69MycnRMdCzdsfwjk/0Gm1L6NJ7AnkUelyOBAxGwmh5cJ3hyuKu6gIbvCM3Dw1Vej5sTXYj4bPpLqt/VAMwjI20qCqPinzOAJ08ImxGOs6oPeuL1y27bsO6pev+ujJSUdBjAHliKxoX33Pd6o2XrJ9/6YfLtepXwoFyEQyUiNhIUnq1ms8rUikO9NaF7nXJ1Sxkl4Rs7bY6AGT+ucd7kUDsduFikDCRRc5KCZhAIptPCy3kEp2x9uDO2O4rHtj+yI8e2f3Mv7NDU95kEiipQrVElaSOi6hiCZKrOHoVcUcrT+ttakxFCTsD0+Yja2Z8B4daKpLGgMhAxOcECsrHFuxRXRI+rg8DT4QEsTcWjFz5QQbjVPZpwDEczs3Mw0DGP8ZXaCvQM/K7/CIft0RjaOahc2rP+totq2+47KJFF3yqOlr1irzBESDoC/Sublx61+2n3bDuvKpz/qI5NPeVGZEG4TWgGqGKosESmWfaNlSDnORGO4xyhsSRMSFs44nO8UnMu5uSEcdpCx4fjP0s1JwF8iXMIdGf7SnfOrjztoMD3WvkRZPAzI/1SNq3LhpUlCxd+89pUZA0eRVbB3hPewMoXseDf49JGBYIKvdVqSYAyQJBuBLwekgYDwrItCUVmZ+H68wBWhTtmsnglByqiNejdcwGByMOhWPBXjE98BjcaPHwSJBQXu9Bk+UqU1WuyqHTyk/57sY5G6+9eP6FH5sRrT6mmAgR9oc6z5l76n/esOiqd66rvuCTC0uX7HQNu6UNk2ckHJWv+UCZfBJqi9aC8jvZYy6Yf/nFQ1XH7Nile26YXIXLgPflB+E5GIxLrAXgFVqwn4YhhQeDhpXjhQXAOlIbpW4xgKdXFGGIwqSR7KMutk8A01FB6Wp1DEUxLd+RzsrkUnlGlOU4FsY3KKrhAnMkHwvTyI1JmomqiOOtaeeYoFwem7R1kAGu2uBzB0SZr6L/lJpTf7hx4cZrNixff3tTVcMzuGya3B85wv5g19rZK75084qrz9q4aMOnarW6PaW+crjuAREbjksbSjU0en18OIuc+ecfPAZhYPDzXVkGlJocJ82uDQ45pQXEkQShsE+kswnLM+2cbaZXxeNsxYANTE7WKzJ9QdKgudsTJdTNHThSRdoQcG2lToRil3tsPEfPZjq4GFeXaVGk2NhTzNU16SYzQCUJQ8+JY5FpjcB15vLybkgk9rLk8pAqaNEWJKtH4xAjXQREUPiNkLEwsug3G2dfeuvGJevePXtG0x9ARNkD9VrB7/UNnD57xRdvWHPNxefVn/t3M3wNO2dEZ4p8FqWAYsiakIJs9XhlLo4tI1wcIchV1PHO7JHn9xe4vC1XoJBRdZStBlUtB1NBVfncumw29iOnBMnCzlWppkHYYshjsT6LbE6FSTMBhbN8ZJDxAjdsFA5iso1FPoNthkFESg/2olsgT4pTUoOaYOec8OJ30JkE09w+YcIMiOjlosE/+4mNCze879qVG65eMKP5iEfaHyuiwUjLmXNO+ecbV1xz0RmVZ/9Tc3R+myunC58WFEGqnVxWzmXy6vDzoGGTqREpYRg7Uv13QsTjal6UhvcmeVjnypYrVF2oeinV7EqSKoF/H18UJs3YCKVR6eJA5mkaUKNSm9t/vhr4iRFXN+0TadjCQLQ7DZVQUxIsA+nCOA1nC9CrYDQ1LzJSAjHQpsEInVe6+KV31r3zjhtPufaypQ0Lv6d5PKr/4A1CSSB88LyFZ/z9tUuuvOjiOes/7zcj/e6sB9KC0WgQRKSEZcZEKChEKj0iuz6oIjj+hdYgpy3T6/N5VSNSMR0USn5q5hxe0oebFNOBZUzL0f6zII5I0ozPBB/k4BikjxymS9U03vxxwtky5oDT/IhXPAWiQLJwYUWuScdxuYzSVhgVWy6dte4vrl++cf0pc1bc6z2KhYpeS5SHS3ad23zK335k7e3nrK1d+6W6UH1vxBdUA7zxbgZXhICkCYUCUqpwYzSZ6l2NU2ZZMGoL2UsDczrSyM4y1dAIJpRhzqOvn0lRkDQW4wxSYjhib7KNmZxkcxyvqYBCEC4PJCruQbEqX1jZRSSLgVMWrF0D3khJMCpySVO4MpoI50tEvd6we139hX/73lPes/6MOWv+E95Ml33XExKV4dIdFy9+xyevXnzFpWsqT/9GY/ncrlJ/JQemyfX5UhzC4fWivGGJQILSMGaHI41kljBLn2BJ2YfTQpEF5T9BO0wHFrt9OC0KkqYQGK6fCKoxEgGCgQpoyoyAijCFLUaNJVFUq4JSY98S7gEKyRbGl7fSlqgtqRONkVn7z6k757PXLr7yyrPnnf55kKVD3e3kwIzSqhcvWnLBne9aes3G2YHF3w15qoarS2cKftmZEwO92DKMKqNmOICchUjNIYczuNCClIM0OcZXuhRLODW1YDoMLO+iGAMUvCNuBA++8O0cakxIO+2FjAHl3fDO5MUgCn0iGL60/KmKXNT/8Kgi3pCoCVR1rIgu/cK1Szauf8f8M/53RaSsYBT3RMaMaNVzV63Z8N7rl113aZN3wfeaqhf057KqATLkQNXEwWIM+MmwAjxE05Wj4TetpGFJqu4JbFJbKfJMB9aZmTdVCy0CRUoaJMP92A80EeNMEZk5bsoD4q2nzwNsfT1vetyki5QsZDs2rtvC1az8roAo1Sv7V5WtvPe6JVdeftGSc/+mPBwtOLJsIgaGkhcPDCauxWGR7/v6YWZ5zZ+vWX3xTdcsvHzD2trTv9UQmdUd9oQhZthlBgeBFW+Xey5vug051mFKjKMHg6FqGw9KLEkN7FVf3tSCayoULERUIJ7BDkAVtidx5HcA5EZlQpZATsD15cuxg47fCmAISrMjnlOB3fYZy+92e/zyvhzX6oF00d1BUeouHTqtavV91y/YePWGZevugFjfZF92xEhnMuenjfRdBw52/CqWSL7TPn1Cob60+pkNiy+4feO8S69bXrbqB9XeusGor0p4Tb8QGbfwemDvwH2CLJ4yIkwusOefKk1KK471wVmnkh3CKMlFfpEwOMeGKhPwv8IoSBrUJcBkdtJxOlIyFqCl7wv45PQJShoZzcVLGvayYVPBMExNc7m0dDIl51JxlmXIXRJfHF38wLuWXPWu9YvX3dpUWf8nO/lRw4LL3t/fXm7k05d2dXX9d1t75/3JZPoU++cTCvVlNX/auPKi91y5eMN1CyILfxF2laZDnojIJDinil7V1EYK9QsbsVI3IAaHhjCgOHrJuEudygOY3pWHPiwSU2bAAe5HO0xujvpx4PxNCWMY/CoKjLhcVvATNZzCASKNS/1qWFZOy6VHvDXRoKgMhLINev3vr1l4xQ3Xrrrs6qbK4/cBLa9Xz+QN0zU8MMjOxJre7u739vUP/6ajq++b8UT6LDvZCYWmqvrfb1y1buM1K6+4bkF0/mO1ocZcOF+e0lz6lGUK9Q51QNsHpJHShJSxJ8pZmhxnJDfZ4cuqZ8cpZ2IwSKpmdKk7TY+CpCkGlDTcuHYu1/hnZHN4ZESkIEGmg+7RPLUlNfFSs2zLJY2Xve99p9546bzq4x/FzRk5D0nNQeYcukBCJxLDlb09PbcfbG//ZdvBnm8lk5nVdvITCnOqG375ntMuu+CyuefetKJy8U8j3vCUMyBdHDzE0YhUD6hZix23toVAG1M1figs2klyD6FADcWgKpSZSlkYBUmj1NPhcCSPA8YXmFGKxEQqJTvcwtESofl0O8XkqAyVbV5Vufpvbjj1houWzVzy/WOZRDYd+ArRaBTqEyTOs9vBJZKJYRlxTSXiZanUyK0dPV2/O3Cw88vpTHaBuurEwsK6WT9av+ycm+vKq6b83jfqQNYK64IdtxY9L9Yw2KEGgSlQHUlHSUobmYDWzfEjDR5Av83+a3KwFbPvRPaXcLkOpkfFoALsFJOjPBrdu2b+ortC/sBRr2pVDCC2LU4vkStFUJWa9gxI+G26bolMOi4G+noqQKqP7dq7/7GOzt7P5nLGTPvykwaoKDghEC20KeBqkxyq7uy95NRYXdKRoQnMMvHIcQTFoSBpZLBWbnI0yKQXMHJJaTM8PCwzwMzKT9QEA+R00Qw+EqSymaqWno5Lixm5r3k0i+KYU1o445BjfC0Q3Y88cwote9ODAX6zO83Qfu3I0PBndu9uebqnZ/DTMNar7Nuc8MA7uj15XWggDpfBV6uCKsIwYKqGkcBUhhSSDVvKF7vbQcPPRa6tU5A0HjdHdE0OR0XJD2ChArhyBFeu5ER0qir5fWwY5irV8cPuzgPX/nzTIz99unXTF+OpZJ19ekpYMPLYk86ZAZm0WpKDdpccxwLJGAz5QSSoqmQcBErJaaxQ9g2DA4Of27Wr5ZmevqGPoPCnHGZ5oiDqL2n3Wz7hM71CwyYHrYE8hCKJAcKowfZqyASlEYdrkHDsuCrO6S5IGmKirFCak+AP/Kos3G242TnTlOThqtpUr4yAH09Asqz/+abHHnh476P37R3Ze05n7FAt46X2z9PAZbFIOKCc2lYFPvG3m8ahWxhQo5xvrrvpWcjUkDoGCJYCibKzO7t6v7qn5eDTQ8OJd6n7nZhY1bjo6+9sPPdDtd76V8LuiIhoUeHJ6dJJ0f06bM2srBdGmzl+mSuHunBsWTivQVcXiYKkYahf7lHO40XOGHHUsRSD46Cq8vBzR4v2wb5zf77lj9/7Q8tz392XaL2yL9MTTLliHFOTc7nRbApAZR3/O4afvR+zDScUA1rhmOGYhwpLwXBOrtnfevAnh9r7fjk8kjjP/vGEAtSLubx+4d3vXXvN+ZcvvOSOCqv8mRJfWT6ohcVA75AoCZeCIPAmYdtxoBfHYbNzlGADkmqqCEworVcDXBjTTyhMJdZwfpL7oxrw/9iGfwXvPx0ODXSf89DWx77101d+8/2d8T037OrYXj6Q7hFQJPAMTLqTxmRfg5sIGMLyW1uvhk2cCS/EUzLEjiP6FT4vbDaNvcaGGBga2HCwvfPXB9t770+lMsvkBScYAl5/7+K6uffecu51l1w854L3NUfmPVNf1miZKUgZUxdeV0CkR9J4e4Z1KHF1uSQJSFOU91qYNHYaqfAmLfipAelzhFcoHBzsPefnm/9w3893/vInW4e23Nqb6aiLZwdEIArDlZ14XBFBitgEx5copT0NkAuq7HHSEK/kSJ0J22TKjl0kMX4eGUlymaQwc9lgPBl7b0tbx5Otbe3/mcnmZtlJTyh4NX14WePC71y36soLL51z0W0LKxdvKvVVQkAHQBy/0GE0e+3lWWBiuGjnFQOWVGHYra4QJqqoI4Fhmb6W3o53/PzlR7/9wPbf/GBPctctncPt1UPJfshOVBrjKjDksrCX+HEJuYCS26fD4J4+GERIGw/5l+8hSSQ39VZqloCzOcJRpaFU5YrinGbrhWiHIcllReDVppMjIj4yUGJY1ie27dz9577+ob+Fp1UuLz7BwE81L5+5+P5rl116ziWzz/9QvW/mtqhWnveZfpGHzS89LfnRjgm9m1OgYCLloI0VstxjKwTHsyoG+7sPrvvFlke++9DeRx7Y0vvC+7ribXWJzJDIWmkRCHGtG07rUAsoRbgGDTIAawYZQdtnTKAASGYOs5ZvQ29BwibHBKI7hBoPjqaTq0nhEhqSXGtGTq/xe8TIUI/w664Z+1r3/8uefQeeBHk+aFl5v33pCQWSZ0Xj/LtvOPOK88+fe86nq/0zWitKqkVQD8EGccPDLC5WUxSzJsN44kwlYWQ8Es6K/eekeGLH859/ZM+j393es/Xa9v4DZQYqlQZZJse14wIiFosLrhbq44cpQZo83GauJJ7jmnKGyUX1ClNYBjyV1BiNT2CTg7zkkhhqGyPL4WnpZXBtGY5L5ZfrqOo84Guen3dmzAMEAqdFOhVf1N8/+I2dO1ueGBiMFbW86huBgNfXd8rsZZ+/ce01Z57btPbTFf7ylqaapna8flEeVGHSTGx20+LwtGDLtPcfTozM2t677crueHtNzpUSHp0dn3D/UCFcooPweQMw1zSldz1euPaGHHzNr99m0mkd0mf68ReAYi0JoFCIZ+PJQ5VmwP1mnxolDWM7hLP6BMHfKfF0zQ1yDYt0JnlKX+/gDw4c6PxZIpFeKxOdgAj7g52nzVr1r+9eecW6M+qWf6IkGG6xf5oWhUnDJBArFBlMTKnCQqf6ofsmx9rQCoctIPeSOGjBLOECgD3iMTTDlfVmRVbLycUDOWxHztfBcyjNaEu7TUY4oXPlMqf8WktOGLkkl0X1QF4UtN5kvmUMC/kyYbkgb1R1VDVUV2NSRYEhBLXhSmxMT2IwL1yhlKNUcpkcpAsHScEmgBvHNFxIiEutMQqQTo/o8fjQVQcPHnq4s2fg6+lMbo59+xMOpcHIvhnRyj/afxZE4ZqdoF1YmNPaK7YhWRRACstt5fk9J054k6d4b3kPtcm/ARJ1TCUqCeDKm/SKCpIGkOOQHRypwS5tosOuGcsfNxJQTakgcAwiMmBmmhlIpmS0p6vrzl179/2pq2fw00gbthOetOBbHwNU5b1qKxK6W0t73BwbSHKooYmM0DJTh5ETJ7iwIKWB7DvBHo0eYHRXirZCKCbN1CCJJ2yOdKVjpgLw6h0Y+3DiH1wniLMnGYGFIKrr6e393K59bX/uH4zdCRIWMSf7xARKoADGtVCn1R8vuFz8/BWDKNyUVJF7FDgzpp7HgCJsBpCGMsVRI0oV4u9p5gGN4dU5dyRHMXb04VLm1eA9pMoGM5z7qb3KGmwcqboYus9m00vbO7q/vO9A16PDI6l3ywQnGQoX+GiAbrqkLNRJtqKkAPt7KGFs4uDMGGF4AKkCwlDSyAWNbDClW2gM7hVBmulBUky3yTxMcCzkeUARRo2hZlGp4mKWFIFoN8n+Hmw6PFrOMIjFhzTDzJ7Z0tZ534H2vl+MxFMXyJudJChY4Gqy3HRAQUxCjWLiNPJKZY9OkAX8g8/lxuoiYWgrqEqUqoxrQ+RphB9+5WRgo3ckwCgRjgATr514/fjzE38nuTmJn7EmA8a0CYlTFg2J/r5uSJ+4L51JX97ZOfDTg53930qmc6vsy44KiVRueUdv4tvJdHa5feo1QUHSoADGKMFGPa5hq2XfHTiVjI0qZFSNTF+pNIHtQ0BdL8e2Ystzk/eh0Yt7yY22D2c8aCLgCcY1j1aw70ldeSxwmK0kjpQ6OFaShMVj51E+5vAYMwkkF4sEzRnj4cxJDjkNB70ytjPQ3yVSmZHSgcHBWw8c6n2ouzf2lXTGWMSnHilMK1+dyOXe3dLW+9vuvtgXUqnsQvun44qCpHHZHwqYXnIoghBMzLQsP7SysR8mATwJHZ4GtBPJgRbKSsGmOkW5Vw+FDpJGMsmiGWphxmA+mF7ZsPK+snB0n0z0BsGRQg6BaNdwc8qEpOGys9xzXT0axwwb0MOidxXw4Rh7k2sLZ+IzDrZ3fLStre+R9s6hz+YMs1repEggJ+5UYkTL4D69vb2fajvU80hX99Bncjmzxk5yXFCQNIQsArv6nUIieEx3ky2JnV1MQ0+C3yOg1yBfYxpw/Ti0Ww+FVxa6Hu6UcHnZPk2R45o0NHxZ6Hmv7CPh5LmgJyLqAzM3X7zwwtsuXHb2XxT7AVKnUifm34FzzOcRfC9uHJVowp/muGevH5JCDhNFPrHJVdGpZHENicL4Edfk5erp/EyzHCFH5SrLggO+dWwoJ66+ymvwTNWtweBgVg7BcPGTj8nh+v6Bgc+0Heh+sn8g8ReWlQ/JTBVAHjlGNvKmmYXxHRPZVGxmf1//Z1va+x7t7hv+IPJ5XDy2gqTBg1QpTgEWNqOj3JM47KfhByT4RZKx2MXkMCFpWFe6Vw2K43cMCFnIsFe44A8H/2mmT1QEq0SVp3rHuY2nf+bdp11x2fJZi4oeiI5nHG7F2nBebfwr8j2czZEalRU1/zZnzrwPu136Xn7/gGRytDbT8Xqeo+pmxNgn1RBJoj5pJDGq2scXOT0FPBvpmJZjlrkmj/zgh5XhtzPndXT1/Pu+tr4/9w+lPoTyitgXTg5kKm9x/SxD3seCBDOMpBgZ7l3c1d/71b0HOh7tHxzhTNNjQkHSaOzzmQIsMIIFmEikpEQuLS2DGDbkZLl8gc5EtEO3S3NbHFscDpWISKREpONZEfRF0C69wky7RMRXJkry5V2rq1d97t2nb9xw9sJTPxcJHPGkf3pZ9mFhTCSNz+9PlJVW3NXcPPv8GbX1f+/RvT261y88mlckUxmh+/xyBgY/1IUL5eAmdjGwj0p2NUiyjEk1WezjzlELkzzSK8A13LM/y4LEsKC24rHhZXta2u7a09bzx3gqM+UAMCp4VEJefd+BMjAnxz1zEbBsOqZZ+fSZBzs6frB3/4HfDceSl6mrjhwFSWNZOQ44tv9SmFgBbGVcU4USJ51ICy8KNBXn5wmhfQoA12qBQFCMjMSEC7YKP8Qp0m5IlhpRqde0ryhbfvf1p1+14bylZ32mNBTZr646YsgXcPI98X0mw2iDwC6TzckW7vV6D9VUV//T/LnzzygrLfsPITxD5eWVctwxP9XDFayofmjDUMJw+AaHvxaC/Bal3EBWu8K50ePiBuUNw1kDAZOrBodjG3nN5ODUN2UIcqittC3xp5XNCC6aOtzfB0kYc2eN7LpDnV0/7RkY+enQcPx8eekRoCBpnOKdqqDVeTVOOAGisGJYcIFACK0FZJ8GtGmypgEVhYL2cM6ySzRWzRKlWuXgLHf9f1+zZP31G1au+9CMsuoX7UuOFnLli2JJ46RVG6WO3cdhw+/37a+trf7LefOazwkEg3cHQsEhjwaigCyUQFw7zw31zNXW+ZER5Q+wBsffZkzaOBHl0U1WiyIR+7KMbBLSm1OXsyKbyUxp3/AuYJ0kC19VlitUvN8bkB2+7FDV8HsyPgSV1edrbW25undw6MH27oF7U+ls0aMQmbtpoYEMhUBbhkMHysrKpBFM8vBrborzUyNnGn7DNP38jJ/f7RcN5Q39M7TqH1+z4qKrrjtz/c2NVXVP2UmPCSj6AjkZw+GEURustUmvDwb82xrqaz40q6nh4lAw+N/BYCijPCWXlDqhYERKXyk5ZGBSSZDDIEnC55LIY2RRG4OGLnhYXqipNEhjgJR29/+kUNfI+4CIMu/IeQ6SMAdbi24/Y0ZcGICrbwX9GuNFkYHBgdsOdff/JFVknKggafgNamZ8PNgwuDnnSRrO4x4c5Bd18yISDku97uZiutMApAmZpuXl8Ie6wIwnz2w87f3XnXX5dY2VtUX3uBYJmVHmbTwm/j0pUKmkzXQIBv3PzZxZc3PDzNoNwWDgd7o3kC2vqJJjgtIovzGyTNwUSZxtlDh2ATtdK5xSQ6oEgmjAMHSRaCpYlvzGEK6T3SzsTOWwT5+IBKJyfWM6J3RUTOTNWXErlUyIdCo1O5lKN6rbTI+CpIGOtZxB1odjrMC56oPuBnODQZGFCHW+NOd8pXYqgPfGguiiP13edOkH7lh74/kL6+Y8YP90vHHYe05sBOOhWvirfp+eNTZKSsK/B3Eubm5uvB5G8p/4qZ5AqEzaRVI1jd8k1H68RJYdoDZ5FKmRdUgPCBkpxQ1jatIwOWxEXIxrYNTQnuGt4HVJg1x+Qx3E8fuC0sBXxMwLHxiZTibcmudwNTwVCpLGdBkWPVt+A1o+SL4wcodMyfgMbsFvJJnIlAlrnatrZwREKYSMm8Mxp8Gs6rrHNy5951Wnzlp6z2s1j5uw8mh+KHhWhpo0x28bTc6D0YrC5qgHFP64ai2Mkkjo53OaGy5sbGi4LRCIbtW8QbnOMe9Np4FyQON8I7R0Of4G5KGXgxNyWClUttw4psgw8bsnIHR/VAwPpNpLo2UP2495NfCAXM7Q6X8x3+x+YWdv3mNC+HBRa7W8Ltdi5vvJ8nBxGC29ZK2oFc+IgqRhtatQ/sQbjpGSYhRvKI/zyKSSTMVB1zzTLy0xCVDw+ra2lqu3tO291T71moLu8JEClWbUVJV+e9bMyjOqyiv/FvXVHgxFobqj8kNqqqI4eU/ZTfQ+SWZWKD0vjhTkKhf8uEje7WmrrCj/1JLFc1aXl4anlMYuMBDPddOOSmW4Ii6Djsg96kNtKp3TKAieIsGohF9dx5OjIGnwsMmb5BuE9v7eM3787KM/fKz1pfu3du39UCqbfT1mABx1GXg87sSMmsrPL12y9NRwOPqPhunuCEJl8XOKbkhoflrRA+OZK5Xzw/MkECU64z6o5h011RUfXbZo7sramoovappn2oUSKBRhhZpc6JFTpJltaoPCKL6RE4VJA7vJPjxi4OWLyXFBcLGegfjI7N++/PTXH9z6hwd3De27KpEfCXcMtEekFC4A1EPhaS5TQLKFGuQYoWtaZ31tzT/MndN8RnXNjK+6tGCMnynUobpkrwIe4UI2GTD0BwKba2tr7pg/r/ms6urKr8E+HLRvMy1gfVJ0uXNpGN+cWgzC+Hx+/DB99pVaYjUXHNIgUagwoHGLmCNiw9GJo/vDTLyjw3Ay3vDI9mf+5cE9jz70XNeLd464hqoyrpjg5Dlf0GVxWoad9DXEmGA/Vui61ga19bHmprp3RqPl3w8EIkMeGLjR0vLBUDj4SEND3U2zZzeeXVFeem+xZHEAtZ3nwHwY5KMD4NmtMzXIEWxUXbLOiquvQqTJaxyrWAAOSY4nYqlk3ePbX/j7n7zyyMNPdz/3qZaR/QuGMn1iKN0rEuaICJf6YBvETE9RH8o4NvIe/7cTIhT0PVdfV34DXPX19XW1H6irrbm4qWnmRaXRku9RpdnJjgiwDzOoUFcWROEbc2V3qrpCFSjrT9mtRTWOIsQub1SU1DoMzAhufsTlnc5mSp/a8dLf/WLb4w89P/jS3+8d2Lk4aUGy5IZFuDwI/ywrQhG/6B/qEcFwAJqrgOw9HigUqDkGBAPeP5dFQ/eEgv7n7VNHjUQyuSIYhPEMQ5rdF/TUlPs+EbaEsSE7S6Hnjxtpsrns2AfwjxTMTZFI57Klz+3d9skfvvCb3z51aNP/2ze4b0XPUJfH0jk2GK6oXxeJRAzinS4pv3EdpJvPAZSFSXOslX407tPriHQmO+9QR9fXBweH/zERHxEMGjO4yoY72ss+DRRhJImOD2lgTrnGxsso3ceH8Jhw9hPBNPg3+Y/jEE8nZ7zYtv3OH7z0618+0vroFw8k9p8Wh/pJ53PC5fPg6XwT7HPwMlya4PATrlNsZUzeXYManyasrpAfF2dh/p13cP6e7Jhw/sZ2QpIG9RLt6R34m9aD7Y8MDQ7emU4nowylkTBcrIl5n957YvWocUOyHse//DQoSBoGfybCLsjR7WgxEBtq/uWO3373oT2/+o+9w6+cnRID7owrLgx3Rphug6Ep+TJqiCc74pyNfbkc9GRpRUmaYxUUJx5lXCOx5HUtBzoe6ezs/pdMMtFE6cvFCeSP7lGyy61Q9lU6jrcuDkWIdt5q6mTHQprh9Mi8/f17z0rkE76sOyUyIim/Xs+ZBxyQxI2ihU93QaCQLCSPnOIi57O4PUVNljsOLvOJgkQiff7+1vZftLd33p9Jp041cmkXV+2SXTZwdDkWh2C9MMJGaVkIDrmKRcHC1DyHL3bMTBTKiJMB7KdNmEqndbdfc1loGVwsmUuYskNaXQaViL2GHPJP9lNL8rhUlpkH0zI1ahB5YhogO9PJ6ILAGx99yzhOSCTTpx1s772nra39Z6lkckMiFvOzI5MuNlWMLPNx1gDLh1Ka/U6FMFanxTGnIGmMnOlW3e1jcB4y9rCpMH1h614fXszDLzkKy61DFXql/YKbys0FcYtfVOsBc9RAczwTDGJXhSk/tVYM5IUnJdLp7NKOjr579u078PDgQP8dBhyGDGwWjo0xsjkRDobkUIfx3ooqJQAcGCWTJJSzOWD1qz4oEIyXFNX/V5A0Lpfm5YMd6VEsikvvysfTCTe/n41jUEy9BNWPmlTpjISBFMJLu+Sypqpvy141pygpgATyLkeN6VvGawJ6RG2HOr+4t7Xt8cGhvjt8Pk8ZB2JlsglJGBq8DKHxC8MkhJPF0T1LhT3d0/cZS7CuPG7d8Lg9cfvUtCh4R7fQ0m5IGgaJZKBoHIHGH08GCgv7cFJAveQDAa6FBlKwBVBwSJuFSyF7hcf0yRUjZOuAfcOpLnI8lJQ0hjD4jSLJiYI4xkp//SQVp610dg/83/0tBx4fHu7/S2GlKlLJEdHX24mKhUxGjXlBmkwqIQdSSfUNIcE29Gpuk0woN5yfbqOzg7pNa7o25RL641GQNGtmLv1qU2TWM14RzGhyYWMdKoNd6qgrVjbVhpy3pOpcfZ0ft5VOzfRlzTWKc9ks8qsMuNGXADnp4rvo5o9mEc/B/0q42s9zm+zOL/gOyEXBNNPh9WBMzrAqO7oGPnmgrefxzu7OfzCMdB0lazIVk2XB1TjlMAZYZ0lIF38oKGdvOOv4yLKXdYLNhlI79h9TgD4CyzsQDO/06toh+/S0KFiYTZXVj924YuPZG2Zf9oFZoVlPB9xB0EIXXHOXlWe5csKErUyBkE7lREAPC35SmELBpSnlMhVAPNOvawZdRQ+yryKTeWFAimTdOZHD5SbHnYBS/IY1bSseM1ZDlzudNbxWMaSx5HQ8Kaq5KDYLiUYiZJqSIfQ6JLPG/ubmkBjVMO17HCPcg4OJ9x1obf9Df1/vfyTj/Ys8+awcX5PNpCFJNKm2OaCLM3vcnB2CsmfvuFvzQlrjDngvZ+wN34JTgHSP+sAYY1uyAeN9vD71TUyWBRsdxzJ7A36RNUWuprryX1Eux0c9EWCwuXzmgu+857R3rbt8weXXLKhY9ohuRbJ+LQLm8xaWSGVScr4PM2dkYZAUrktZFfCGRmdkSwlFQILxR0eCyVP4zTl2so18sT5Hz06NIpJMAVYDs6n+Or4YGUlddPBg38MH29rvTiZiy/MciMVJg2gVjEeOqn6nXCaUqfPmObjcTMsl/LnneBoD5/g9CIJagQ0ulczIMTpMQ4eDHz1B1fXPmzPro5Fw8KcycREoombHwB7lRfVzfnbNig2XXLXwyusa9Lm/qw7Xp/wev0B7gK51iVh8AKIOulbTIAmy045KB7NplkC4cOQCbReWAoc/c1AQWpI9B0i2/gngi6v28tqDwsk+PC5IpnJr2g4N/qDtUPfPR0aG15lmxstRfJR+csNrqU8/qspVRxTdk+karg7GdQDzYnCwH3uIDY6iNE050J/qidKIaohTi1jOHDbq9weGIqHIt2bParqsJBz8L3Wv4nBUhYEKsxbWzX7wvWe86+LLZl/87jnhBb8vD1YZGozXkDck0mA0RaNZ4HsCeE88X0cJQa/C+KU0URueIWuKhKFampwbHKfG/+0/p4Ys8WNB4UcUg3TGmH+wc/jL3f3xX/cP9F3vypuBZGJERnKlwSrGjFYpVaRk4cbsO68w8VitA0jisKFyBCDBMqNnxXsxlMFvOnl1Djv1xaqrqu9raKi/pHFm7e3BoP9ZecER4KhIMx7zqmf94j0rr1p3yaz1719avfrJUl9VNuKLimyKMwSNQvdHjdPPVoUjW5VDELQqimg1DNEppAngIlrFLZ82OeuKgnyFY2INPKIZXX1D/9TZN/Tb3r6ujw32d9akEkNyvrU/oKbvjpciKi6mymQMDlnGbwokCyUUDeahoSFps5E86XRSjuDzB4OcBRrzBwL/09hQt6G6uuLWcCh4xGRxMD5Xx4QVDQvv2zD/wnVr6878TH1k9raKaG0iHAhNO/5X1oTLlOvh8ZPKhDKdqZqwkwWpdMNU0kaV+GsL2sn24REBxntpd9/IX3X2DDzW3tH+v/t722eFgvxEUFL4fbA9oJH5iaOJfUVjcKrHIcgYUcaD0kQauCAOZxyQPOy0rKiooL2TCvh9P25qrL981qz6GyOR0DF/E/S4kYbQPJ702rnLv3jlinXrl1Us/lxTWeO085cgkt1WHkqMkTwGI0GSQoPSpegGZAELD42aYkhzTO+JBxwRabjKw8BQ4oN7Wrqe6O7t/cKhQ60L5VgxKytGBnqhjrIy3kKtyUCd4zVObBh8sVGrjeXibBPAGRa0V+hZef0BpPHQhU57NP1HTU2NG5ua6q+LRILHbS7ZcSWNg5Jg8ODp85Z+dmHD3GnnMUF7w+7JQj5LHxoFNFYgjDs4UEbhqwHFRjN6epYRfNBRA7eX82YLA3z2DA0nbtzT0vloe0fX19Pp4aXZ5IgrEvKJXCopw/10e0OBIAiibBFKBwdOgzgy0MXmdBfGzjQRjyXN8rKKB2bOrL9idvOs60si4UfshMcNrwlpioVh5QIuT05jb7b82r2c4OWS677IIRloMWopF1WY3FP0ElIU6z6jGNLwY0/U87zeac2jsRrsnWPnPMG0zrHJbzQXwPBI8vL9Bzr/2NHZc388NnhaJjXitqCGqILYR8RZjjJsgPZhZvkf30WtV+N8wIxM8vKLw1BZHGzGTyaq1SdYCMinHdzz6F5Q2SWnTDM2EwxFeA8zEAw9vGDh/CsbGmqvjpZEjjtZHLyhpAHyuWzGYE8tycCpoqpSkS23R05r1VCw47PpEIiAJUQZUowUKPo9nfs75OL/Xn3q6cWxeOrcPfvbH+js7vtBb2/vWWY+58lbafndBC6Bn82lJVlGPaFRj8g5VuDwTA4CR2HIWArnxlMScYSiQ14SiESJxWJyVS3N41dudF48MXNm7U3z5sy6rCwa/ZVM/BpiLNdvAFAxrvJwmcHopYZW5ME+k+bHSNGC0PJcHrkK1WgFOnAqVlkCo1p/OkxZ6cR4IjpwnklX2DSNVz0jmUyf1nao6/ud3b2/hvF55cjQQNDHj76aGcGvtnDYAr+V6UclS4pQUtjbROJQevBD+CQIScM5T8FwCGQRIM8IksGwzWRFIBSW02rDoVJRXlnDqPCLdXW1758/f+7FFeVlP8ANC0rd4wHm/A1DOpOJZjOm7nMHhNvSRTZuiHCAUWboZ7iRrEy5UNAk4G9ylnkR30YAAaZVL6MknEAehzjucddnMtmm1taDX2s72P6HeCz27oHB/vCBlt1o8ewIycFrSYyOyx0dnztKEsLey3OEWxLFmWHJPDDmQnVJSVNaWi7zQdWUzVhC8/kplbeWloQ/sGzJvLOqKsu+CbV+xLNUjwVvKGkqw5X7qtwzns0Ou4TPColooBLE4YoG8KJynOjFr5/EUJBoioAkil2xqkJdcNgLf+/JOoKPlh5+f9t28nmzqNCynp6ev96/v+XPyWTiw7A7wsMj/aIk7BdlpSVqbjYkRACVypF0jGv7ITG5zIcChYDaaFaPN605vxqsAOEgmfyUNlzHMC9VT39/v8ihEZWUlYOE3j0zqqruXLxo/unVVeX3II/TTWp6zeCa2Lpeb8TTyZpdXfsv2znQ+r59vW1nIkewD10ilhkQeT0r3DqIkqURi1K2YzkscdpAfleg+xNr378mGoi0qx8mx4GD3Z9PJAb+mhFSkoGRHe7Hf1yDcIjiQH4NBudMw3y+pKTEl81klnOONO0PKVEgBSkduOYL701pwThJIqa+HsxFERzDfTxU5GkMjOXxetoyBL84zF5tekUBf0iks7muyoqKr4AoX9c8niGZ6A3EGyppiLA/2L1m1tJv3bDqsvOuXXHpDXPLZj9qZcxYOdfuM/hBijTE/tiwifEk97hlnKYgcM207ymJNIEwBJ9FQgUDoVNjI/Hl/JS0DjuLhGGklaSjO8QOf5KFHYMkDD0i2mU0hbjYpIKKQak4lNqcifkkB8nFlbQyWUMuEmBA2qZT2e5IOPQPixbMXV43o+qfTwTCEG84aRyg0qxFM5p/dMOpl154/corbq33zHy0VK8UIVdU2jvsOxkLlyjJwIET8qAAcG+l344Ejidv5aUx6qMLDFtDejCwVTiWhaSSy99ysSAcsxuEKoWrQbCHWbrEdKVtkozCJosDut4UN+l01lZPRqyutvb/rVq5Ym1t7Yx/1DWt1056QuCEIc14zJ/R9NMbT9144XULr333vNDSp8NaVU7X6Hpq0i3lWr6Mrgojr1vFfMMSVWKOk1LOfhSswIkbK5m2FI49mktk+O1MrtGDR9OFpsdHu4VrAqtYi1cYIBiFD8e2kEIUg+weIYlysNEcT4kEUe+SEy7sGZjzQg3pXv9ISTT6lUWLFq6urq78P16v3irzd4LhhCSNg4V1s354w2lXnH/JnPM+3hhu2OLLB0VpsFyuXG5k8sKdFXrOMJQhMA1owtiHxwZqOVvTKeLxmDaR87eCUnX8G+QB6TjSzhcISVXnDwaktGJQLlJSAnXFj4sZGajj78xubrigqaH24z6vvlfe6ATFCU0awuN2Z9c0LfrGLauvfMeGeev+qsZTt9OTC4rqUD2EjZtDbgpKGrR5C1WrDOBxm4PxMZTD4ijO8fhz2NT8aB7bEmncJudq0UO3N3p+jL+QWJQslDiOzYO3i0Ujke8tXjz/wpn1VbeEgv5jXcX0dcEb7j0dKYaSsbnb2ve+d0fn3pvD3nD64iVnXlUeie60f54UbYe6/yUe7/tbjvOR0VWoEe5pgHLP6h8PVv/hODzFWJnZKW2vTp23z1HFSaKxj4lBf7WYJT0yXfcavoDvR9WVFXeFQ4EnZaKTCCcdaRz0DA2uTGUyM5pqZky9Bp0NkOZziVjfp+WKoyQN3pl7rnYp/3ZgV/KruyfH0hxGjFHSjLOX7Hl51FByQWmQxTQ8orS8nMZzLlIS/nVFWemXIpHQ4zLhSYhxJXZyobq0bHMxhDk+oMuvRtWNEWYMPO9sBG0arqNMN5qBO6/fb5lW/uHGxplXzmqsv+pkJgxx0pLmSAATxBz//W0HE+Mmh3lO48gxRpbDN+kdccN/tFPYV0ZviJuM2Lk8ZihQ8nhtbc21c+c0bIiWhB7ChSc93hKkYdtnFBbKSP7l7AtjHEkkoca6sKQtbIPus3Sj2enqZpDPKwLByFMN9U03NDc3rasoj/4MyZXeehPgLUEaGJ5J4dLyLk0XeY9XxkUoDTjvhwQy4IKp/iAQAwKC320iSWifyKGYGn7Hse7T5D5nZqUKouvMbyCQMHkGcNw6OxSfraurf++82bPPKy2N/gjppu0sPRlx0hrCR4J0xpjT0dP/N26P5/KhwcHaXCYN4oAE8Hp8XgbeMnDK1Vge1UHJSK5azzedgccFPni97DxNIH1A/s6hClz5O5HOCC/cZ6/Pt7m6svzrZdHId91uFxfxfdPiLUEaB7FEem3/cPL2VDpzGfhRm00nxfBQvwgH/JI0BEnDifWUIuyApFuuJA5cc0gnemChUASk4WrjuggHwzvLyku+DBX0Q83jGZA3eZPjLUUaB7FE5pzu/uH3w2XfIAyzLJdNymENJAuHOJAYfr93VAVxIJga4yJkZJfDFkCu/TNra78RjYbvO9H6hl5rvCVJ42Aknj6/u2/kE5l06p0ib4bkdBIQhORhf1MiFpdDHHx+fijEkmoonU4dqK+dcXd5WfQ+Xdc67Vu9pfCWJo2DoZHkhuGR5Mf7+nrX8VM2tHlo54RDIaFBwiQ5kMrlOlRXU/P1iorod7y6Nu34nTc73iaNDZSDNjQcf8/QSPzjiVhshaZ5dPaoezStvaKi4r6y0pJ7/T69xU7+lsbbpJkAK5/3x2Lpa0fiiY0Bv39fSdj/Na9Xa7N/fhvA26R5G0eMt0hE+G0cT7xNmrdxhBDi/wcOiLKI3YhDBgAAAABJRU5ErkJggg==";
    if (!user) {
      toast.error("You must be logged in to request a report.");
      return;
    }

    if (incomeData.length === 0 && expenseData.length === 0) {
      toast.warning("No data recorded");
      return;
    }

    function addWatermark(doc, pageWidth, pageHeight) {
      const logoWidth = 85;
      const logoHeight = 85;
      const xPosition = (pageWidth - logoWidth) / 2;
      const yPosition = (pageHeight - logoHeight) / 2;

      doc.addImage(
        logoBase64,
        "PNG",
        xPosition,
        yPosition,
        logoWidth,
        logoHeight,
        undefined,
        "FAST"
      );
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    addWatermark(doc, pageWidth, pageHeight);

    const margin = 8;
    const contentWidth = pageWidth - 2 * margin;
    const columnWidth = contentWidth / 2;
    let leftColumnYOffset = margin;
    let rightColumnYOffset = margin;

    function addPage() {
      doc.addPage();
      addWatermark(doc, pageWidth, pageHeight);
      leftColumnYOffset = margin;
      rightColumnYOffset = margin;
    }

    function checkPageBreak(column, height = 10) {
      const yOffset =
        column === "left" ? leftColumnYOffset : rightColumnYOffset;
      if (yOffset + height > pageHeight - margin) {
        addPage();
      }
    }

    function formatCurrency(amount) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    }

    // Set default font
    doc.setFont("helvetica");

    // Header section
    function generateHeader() {
      const userName = user.displayName || "Unknown User";
      const formattedTime = new Date().toLocaleString();

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated by: ${userName} | Generated on: ${formattedTime}`,
        pageWidth / 2,
        leftColumnYOffset,
        { align: "center" }
      );
      leftColumnYOffset += 12;
      rightColumnYOffset = leftColumnYOffset;

      doc.setFontSize(28);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", "bold");
      doc.text("Income and Expense Report", pageWidth / 2, leftColumnYOffset, {
        align: "center",
      });
      leftColumnYOffset += 20;
      rightColumnYOffset = leftColumnYOffset;

      // Add a horizontal line
      doc.setDrawColor(189, 195, 199);
      doc.setLineWidth(0.5);
      doc.line(
        margin,
        leftColumnYOffset,
        pageWidth - margin,
        leftColumnYOffset
      );
      leftColumnYOffset += 15;
      rightColumnYOffset = leftColumnYOffset;
    }

    // Income section
    function generateIncomeSection() {
      let totalIncome = 0;
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(39, 174, 96);
      doc.text("Income", margin, leftColumnYOffset);
      leftColumnYOffset += 12;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(52, 73, 94);
      incomeData.forEach((item) => {
        checkPageBreak("left");
        const createdAt = item.createdAt
          ? new Date(item.createdAt).toDateString()
          : "Unknown date";
        const amount = item.amount || 0;
        totalIncome += amount;
        doc.text(
          `• ${createdAt}: ${formatCurrency(amount)}`,
          margin,
          leftColumnYOffset
        );
        leftColumnYOffset += 8;
      });

      leftColumnYOffset += 10;
      checkPageBreak("left");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total Income: ${formatCurrency(totalIncome)}`,
        margin,
        leftColumnYOffset
      );
      leftColumnYOffset += 20;

      return totalIncome;
    }

    // Expense breakdown section
    function generateExpenseBreakdown(totalExpenses, categoryTotals) {
      leftColumnYOffset += 10;

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);
      doc.text("Expense Breakdown", margin, leftColumnYOffset);
      leftColumnYOffset += 12;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(52, 73, 94);

      const entries = Object.entries(categoryTotals);
      entries.forEach(([category, total]) => {
        checkPageBreak("left");
        const percentage = ((total / totalExpenses) * 100).toFixed(2);
        const text = `• ${category}: ${formatCurrency(total)} (${percentage}%)`;
        doc.text(text, margin, leftColumnYOffset);
        leftColumnYOffset += 8;
      });

      leftColumnYOffset += 10;
    }

    // Summary section
    function generateSummary(totalIncome, totalExpenses) {
      checkPageBreak("left", 30);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 62, 80);
      doc.text("Summary", margin, leftColumnYOffset);
      leftColumnYOffset += 15;

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Income: ${formatCurrency(totalIncome)}`,
        margin,
        leftColumnYOffset
      );
      leftColumnYOffset += 10;
      doc.text(
        `Total Expenses: ${formatCurrency(totalExpenses)}`,
        margin,
        leftColumnYOffset
      );
      leftColumnYOffset += 10;

      const overallTotal = totalIncome - totalExpenses;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Overall Total: ${formatCurrency(overallTotal)}`,
        margin,
        leftColumnYOffset
      );
      leftColumnYOffset += 12;

      // Add a visual indicator (green for profit, red for loss)
      const indicatorRadius = 4;
      doc.setFillColor(
        overallTotal >= 0 ? 39 : 231,
        overallTotal >= 0 ? 174 : 76,
        overallTotal >= 0 ? 96 : 60
      );
      doc.circle(margin - 2, leftColumnYOffset - 2, indicatorRadius, "F");
    }

    // Generate the report
    generateHeader();

    const totalIncome = generateIncomeSection();

    function generateExpensesSection() {
      let totalExpenses = 0;
      const categoryTotals = {};

      doc.setFontSize(20);
      doc.setTextColor(231, 76, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Expenses", margin + columnWidth, rightColumnYOffset);
      rightColumnYOffset += 12;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(52, 73, 94);
      expenseData.forEach((expense) => {
        checkPageBreak("right", 20);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(
          `Category: ${expense.title}`,
          margin + columnWidth,
          rightColumnYOffset
        );
        doc.setFont("helvetica", "normal");
        rightColumnYOffset += 8;

        if (Array.isArray(expense.items) && expense.items.length > 0) {
          expense.items.forEach((item) => {
            checkPageBreak("right");
            const createdAt = item.createdAt
              ? new Date(
                  item.createdAt.toMillis
                    ? item.createdAt.toMillis()
                    : item.createdAt
                ).toDateString()
              : "Unknown date";
            const amount = item.amount || 0;
            totalExpenses += amount;
            categoryTotals[expense.title] =
              (categoryTotals[expense.title] || 0) + amount;
            doc.setFontSize(11);
            doc.text(
              `• ${createdAt}: ${formatCurrency(amount)}`,
              margin + columnWidth + 5,
              rightColumnYOffset
            );
            rightColumnYOffset += 8;
          });
        } else {
          doc.setFontSize(11);
          doc.text(
            "No items found for this expense.",
            margin + columnWidth + 5,
            rightColumnYOffset
          );
          rightColumnYOffset += 8;
        }
        rightColumnYOffset += 10;
      });

      rightColumnYOffset += 10;
      checkPageBreak("right");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total Expenses: ${formatCurrency(totalExpenses)}`,
        margin + columnWidth,
        rightColumnYOffset
      );
      rightColumnYOffset += 20;

      return { totalExpenses, categoryTotals };
    }

    const { totalExpenses, categoryTotals } = generateExpensesSection();
    generateExpenseBreakdown(totalExpenses, categoryTotals);
    generateSummary(totalIncome, totalExpenses);

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10);
    }

    // Save the document with the date in the filename
    const formattedDate = new Date().toISOString().split("T")[0];
    doc.save(`pennytrack_${formattedDate}.pdf`);
    toast.success("Report Downloaded");
  }

  return (
    <header className="container max-w-2xl px-6 py-6 mx-auto">
      {/* PennyTrack_Logo */}
      <div className="flex items-center justify-center py-3">
        <Image
          src="/images/favicon.png"
          alt="logo"
          width={35}
          height={35}
          className="object-cover"
        />
        <Image
          src="/images/pt.png"
          alt="logo"
          width={140}
          height={35}
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-center">
        <hr className="py-3 w-1/3"></hr>
      </div>

      <div className="flex items-center justify-between">
        {/* User Info */}
        {user && !loading && (
          <div className="flex items-center gap-2">
            <div className="h-[40px] w-[40px] rounded-full overflow-hidden">
              <img
                className="object-cover w-full h-full"
                src={user.photoURL}
                alt={user.displayName}
                referrerPolicy="no-referrer"
              />
            </div>

            <h4>
              <span className="mr-2">Hi,</span>
              <span className="font-bold sm:text-sm text-xl">
                {getFirstName(user.displayName)}
              </span>
            </h4>
          </div>
        )}
        {user && !loading && (
          <nav className="flex items-center gap-4">
            <div className="text-2xl">
              <a href="#stats">
                <MdOutlineQueryStats className="hover:scale-110 transition-all duration-200" />
              </a>
            </div>
            <div>
              <button onClick={logout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </nav>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        {/* Conditionally render the Generate Report button */}
        {user && !loading && (
          <button onClick={handleGenerateReport} className="btn btn-primary">
            Generate Report
          </button>
        )}
        {/* Currency Selection Dropdown */}

        {user && !loading && (
          <div className="mt-4 flex items-center">
            <div className="relative">
              <select
                id="currency-select"
                value={currency}
                onChange={handleCurrencyChange}
                className="block w-25 pl-3 pr-6 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              >
                {currencies.map((curr) => (
                  <option
                    key={curr.code}
                    value={curr.code}
                    className="text-gray-900 dark:text-white"
                  >
                    {curr.code}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Nav;
