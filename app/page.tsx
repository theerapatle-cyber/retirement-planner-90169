
"use client";

import * as React from "react";
import { useRetirementApp } from "@/hooks/useRetirementApp";
import { LoginScreen } from "@/components/retirement/LoginScreen";
import { PlanSelectionScreen } from "@/components/retirement/PlanSelectionScreen";
import { RetirementDashboard } from "@/components/retirement/RetirementDashboard";
import { FamilyDashboard } from "@/components/retirement/FamilyDashboard";
import { RetirementInputPage } from "@/components/retirement/RetirementInputPage";
import { InsuranceTableModal } from "@/components/retirement/DashboardModals";

export default function HomePage() {
  const {
    state,
    setters,
    calculations,
    handlers
  } = useRetirementApp();

  const {
    user, planType, familyMembers, currentMemberId, showFamilyResult,
    form, gender, inputStep, showResult,
    retireSpendMode,
  } = state;

  const {
    setForm, setPlanType, setShowFamilyResult,
    setGender, setRetireSpendMode, setInputStep, setShowResult,
    setShowInsuranceTable
  } = setters;

  const {
    inputs, result, mcResult
  } = calculations;

  const {
    // Shared
    handleLogin,

    // Family
    handleSwitchMember, handleAddMember, getFamilySummary, syncCurrentToFamily,

    // Dashboard / Insurance
    addInsurancePlan, removeInsurancePlan, updateInsurancePlan, updateSurrenderTable,
    handleExportCSV, handlePrint, handleChange, changeBy,

    // Allocations
    addAllocation, removeAllocation, updateAllocation
  } = handlers;

  // 1. Unauthenticated -> Login Screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. No Plan Selected -> Plan Selection Screen
  if (!planType) {
    return (
      <PlanSelectionScreen
        onSelect={(type) => {
          setPlanType(type);
          // If family, we go to Family Dashboard
          if (type === "family") {
            setShowFamilyResult(true);
          } else {
            // Individual -> Input Page First
            setShowResult(false);
          }
        }}
      />
    );
  }

  // 3. Family Dashboard (Full Page Overlay for Overview)
  if (planType === "family" && showFamilyResult && familyMembers.length > 0) {
    return (
      <FamilyDashboard
        familyMembers={familyMembers}
        currentMemberId={currentMemberId}
        form={form}
        gender={state.gender}
        savingMode={state.savingMode}
        returnMode={state.returnMode}
        allocations={state.allocations}
        setPlanType={setPlanType}
        setShowFamilyResult={setShowFamilyResult}
        handleSwitchMember={handleSwitchMember}
        handleAddMember={handleAddMember}
        getFamilySummary={getFamilySummary}
      />
    );
  }

  // 4. Input Page (Individual View)
  if (!showResult && !showFamilyResult) {
    return (
      <>
        <RetirementInputPage
          user={user}
          form={form}
          handleChange={handleChange}
          changeBy={changeBy}
          gender={gender}
          setGender={setGender}
          setShowResult={setShowResult}
          addInsurancePlan={addInsurancePlan}
          removeInsurancePlan={removeInsurancePlan}
          updateInsurancePlan={updateInsurancePlan}
          onViewTable={() => setShowInsuranceTable(true)}
          savingMode={state.savingMode}
          setSavingMode={setters.setSavingMode}
          returnMode={state.returnMode}
          setReturnMode={setters.setReturnMode}
          allocations={state.allocations}
          addAllocation={addAllocation}
          removeAllocation={removeAllocation}
          updateAllocation={updateAllocation}
        />
        <InsuranceTableModal
          show={state.showInsuranceTable}
          onClose={() => setShowInsuranceTable(false)}
          form={form}
          addInsurancePlan={addInsurancePlan}
          removeInsurancePlan={removeInsurancePlan}
          updateInsurancePlan={updateInsurancePlan}
          updateSurrenderTable={updateSurrenderTable}
        />
      </>
    );
  }

  // 5. Main Retirement Dashboard (Individual View)
  if (showResult) {
    return (
      <RetirementDashboard
        user={user}
        form={form}
        setForm={setForm}
        inputs={inputs}
        result={result}
        mcResult={mcResult}
        planType={planType}
        syncCurrentToFamily={syncCurrentToFamily}
        setShowFamilyResult={setShowFamilyResult}
        handleExportCSV={handleExportCSV}
        handlePrint={handlePrint}
        addInsurancePlan={addInsurancePlan}
        removeInsurancePlan={removeInsurancePlan}
        updateInsurancePlan={updateInsurancePlan}
        updateSurrenderTable={updateSurrenderTable}
        setRetireSpendMode={setRetireSpendMode}
        retireSpendMode={retireSpendMode}
        handleChange={handleChange}
        changeBy={changeBy}
        setGender={setGender}
        gender={gender}
        // Extended Props
        savingMode={state.savingMode}
        setSavingMode={setters.setSavingMode}
        returnMode={state.returnMode}
        setReturnMode={setters.setReturnMode}
        allocations={state.allocations}
        addAllocation={addAllocation}
        removeAllocation={removeAllocation}
        updateAllocation={updateAllocation}
        onViewTable={() => setShowInsuranceTable(true)}
      />
    );
  }
}
